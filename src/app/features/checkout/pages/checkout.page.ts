import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, forkJoin, switchMap, tap } from 'rxjs';
import { Listing } from '../../../core/models/listing.model';
import {
  CheckoutProvider,
  CheckoutResponse,
  OrderCreatePayload,
  ShippingOption,
  ShippingSelectionPayload,
} from '../../../core/models/order.model';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ListingsService } from '../../../core/services/listings.service';
import { OrdersService } from '../../../core/services/orders.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatMoney } from '../../../core/utils/format.utils';

type ShippingControlName = keyof ShippingSelectionPayload;
type CheckoutData = { listing: Listing; shippingOptions: ShippingOption[] };

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly listingsService = inject(ListingsService);
  private readonly ordersService = inject(OrdersService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly listing = signal<Listing | null>(null);
  readonly shippingOptions = signal<ShippingOption[]>([]);
  readonly provider = signal<CheckoutProvider | null>(null);
  readonly createdOrderId = signal<number | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitted = signal(false);
  readonly form = this.createForm();

  constructor() {
    this.loadCheckout();
  }

  loadCheckout(): void {
    this.startLoading();
    const provider = this.route.snapshot.paramMap.get('provider');
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    if (!this.isCheckoutProvider(provider) || !slug) {
      this.failLoading();
      return;
    }
    this.provider.set(provider);
    forkJoin({
      listing: this.listingsService.detail(slug),
      shippingOptions: this.ordersService.shippingOptions(),
    }).subscribe({ next: (data) => this.setCheckoutData(data), error: () => this.failLoading() });
  }

  submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    const listing = this.listing();
    const provider = this.provider();
    if (this.form.invalid || !listing || !provider || this.isSubmitting()) {
      return;
    }
    this.isSubmitting.set(true);
    this.checkoutRequest(listing.id, provider).subscribe({
      next: (response) => this.redirectToProvider(response),
      error: () => this.handleCheckoutError(),
    });
  }

  selectedShippingOption(): ShippingOption | null {
    const optionId = this.form.controls.shipping_option_id.value;
    return this.shippingOptions().find((option) => option.id === optionId) ?? null;
  }

  fieldInvalid(field: ShippingControlName): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  listingImage(): string {
    const images = this.listing()?.images ?? [];
    const primaryImage = images.find((image) => image.is_primary) ?? images[0];
    return primaryImage?.image_url ?? '';
  }

  listingPrice(): string {
    return this.money(this.listing()?.price ?? '0', 'EUR');
  }

  shippingPrice(): string {
    const option = this.selectedShippingOption();
    return this.money(option?.amount ?? '0', option?.currency ?? 'EUR');
  }

  shippingOptionPrice(option: ShippingOption): string {
    return this.money(option.amount, option.currency);
  }

  providerLabel(): string {
    return this.text(
      this.provider() === 'paypal' ? 'checkoutProviderPaypal' : 'checkoutProviderStripe',
    );
  }

  submitLabel(): string {
    if (this.isSubmitting()) {
      return this.text('checkoutStartingPayment');
    }
    return this.text(
      this.provider() === 'paypal' ? 'checkoutContinuePaypal' : 'checkoutContinueStripe',
    );
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private createForm() {
    const user = this.authService.user();
    const profile = user?.customer_profile;
    return this.formBuilder.nonNullable.group({
      shipping_option_id: [0, [Validators.required, Validators.min(1)]],
      recipient_name: [user?.full_name ?? '', [Validators.required, Validators.maxLength(180)]],
      address_line_1: ['', [Validators.required, Validators.maxLength(180)]],
      address_line_2: ['', [Validators.maxLength(180)]],
      postal_code: ['', [Validators.required, Validators.maxLength(30)]],
      city: [profile?.city ?? '', [Validators.required, Validators.maxLength(120)]],
      country: [profile?.country ?? 'Germany', [Validators.required, Validators.maxLength(120)]],
    });
  }

  private checkoutRequest(
    listingId: number,
    provider: CheckoutProvider,
  ): Observable<CheckoutResponse> {
    const shipping = this.form.getRawValue();
    const orderId = this.createdOrderId();
    if (orderId) {
      return this.ordersService
        .selectShipping(orderId, shipping)
        .pipe(switchMap(() => this.ordersService.startCheckout(provider, orderId)));
    }
    const payload: OrderCreatePayload = { listing_id: listingId, quantity: 1, shipping };
    return this.ordersService.create(payload).pipe(
      tap((order) => this.createdOrderId.set(order.id)),
      switchMap((order) => this.ordersService.startCheckout(provider, order.id)),
    );
  }

  private setCheckoutData(data: CheckoutData): void {
    this.listing.set(data.listing);
    this.shippingOptions.set(data.shippingOptions);
    if (!data.shippingOptions.length) {
      this.failLoading();
      return;
    }
    this.form.controls.shipping_option_id.setValue(data.shippingOptions[0].id);
    this.isLoading.set(false);
  }

  private redirectToProvider(response: CheckoutResponse): void {
    const url = response.provider === 'stripe' ? response.checkout_url : response.approve_url;
    window.location.href = url;
  }

  private handleCheckoutError(): void {
    this.isSubmitting.set(false);
    this.toast.error(this.text('checkoutStartFailed'));
  }

  private startLoading(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
  }

  private failLoading(): void {
    this.isLoading.set(false);
    this.hasError.set(true);
  }

  private isCheckoutProvider(value: string | null): value is CheckoutProvider {
    return value === 'stripe' || value === 'paypal';
  }

  private money(value: string, currency: string): string {
    return formatMoney(value, currency, this.i18n.current());
  }
}
