import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, forkJoin, switchMap, tap } from 'rxjs';
import { Listing } from '../../../core/models/listing.model';
import {
  BuyerCapacity,
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
import {
  DropdownComponent,
  DropdownOption,
} from '../../../shared/components/dropdown/dropdown.component';


type ShippingControlName = keyof ShippingSelectionPayload;
type CheckoutData = { listing: Listing; shippingOptions: ShippingOption[] };
type SelectedBuyerCapacity = Exclude<BuyerCapacity, 'undetermined'>;
type CapacitySelection = SelectedBuyerCapacity | '';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DropdownComponent],
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
  readonly capacityOptions = computed<DropdownOption<CapacitySelection>[]>(() => [
    { value: '', label: this.text('checkoutCapacityChoose') },
    { value: 'consumer', label: this.text('checkoutCapacityConsumer') },
    { value: 'business', label: this.text('checkoutCapacityBusiness') },
  ]);

  constructor() {
    this.loadCheckout();
  }

  loadCheckout(): void {
    this.startLoading();
    const provider = this.route.snapshot.paramMap.get('provider');
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    if (!this.isCheckoutProvider(provider) || !slug) return this.failLoading();
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
    if (!this.canSubmit(listing, provider)) return;
    this.isSubmitting.set(true);
    this.checkoutRequest(listing!.id, provider!).subscribe({
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

  capacityInvalid(): boolean {
    const control = this.form.controls.buyer_capacity;
    return control.invalid && (control.touched || this.submitted());
  }

  noticeRequired(): boolean {
    return this.listing()?.seller_type === 'commercial' && this.capacity() === 'consumer';
  }

  noticeInvalid(): boolean {
    return this.noticeRequired() && !this.form.controls.withdrawal_cost_notice_confirmed.value;
  }

  capacity(): CapacitySelection {
    return this.form.controls.buyer_capacity.value;
  }

  setCapacity(value: CapacitySelection): void {
    this.form.controls.buyer_capacity.setValue(value);
    this.form.controls.buyer_capacity.markAsTouched();
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
    if (this.isSubmitting()) return this.text('checkoutStartingPayment');
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
      buyer_capacity: ['' as CapacitySelection, Validators.required],
      withdrawal_cost_notice_confirmed: [false],
      shipping_option_id: [0, [Validators.required, Validators.min(1)]],
      recipient_name: [user?.full_name ?? '', [Validators.required, Validators.maxLength(180)]],
      address_line_1: ['', [Validators.required, Validators.maxLength(180)]],
      address_line_2: ['', [Validators.maxLength(180)]],
      postal_code: ['', [Validators.required, Validators.maxLength(30)]],
      city: [profile?.city ?? '', [Validators.required, Validators.maxLength(120)]],
      country: [profile?.country ?? 'Germany', [Validators.required, Validators.maxLength(120)]],
    });
  }

  private canSubmit(listing: Listing | null, provider: CheckoutProvider | null): boolean {
    return Boolean(
      !this.form.invalid &&
        !this.noticeInvalid() &&
        listing &&
        provider &&
        !this.isSubmitting(),
    );
  }

  private checkoutRequest(
    listingId: number,
    provider: CheckoutProvider,
  ): Observable<CheckoutResponse> {
    const orderId = this.createdOrderId();
    if (orderId) return this.resumeCheckout(orderId, provider);
    return this.createCheckout(listingId, provider);
  }

  private resumeCheckout(orderId: number, provider: CheckoutProvider): Observable<CheckoutResponse> {
    return this.ordersService
      .selectShipping(orderId, this.shippingPayload())
      .pipe(switchMap(() => this.ordersService.startCheckout(provider, orderId)));
  }

  private createCheckout(listingId: number, provider: CheckoutProvider): Observable<CheckoutResponse> {
    return this.ordersService.create(this.orderPayload(listingId)).pipe(
      tap((order) => this.completeOrderCreation(order.id)),
      switchMap((order) => this.ordersService.startCheckout(provider, order.id)),
    );
  }

  private orderPayload(listingId: number): OrderCreatePayload {
    return {
      listing_id: listingId,
      quantity: 1,
      buyer_capacity: this.selectedCapacity(),
      withdrawal_cost_notice_confirmed:
        this.form.controls.withdrawal_cost_notice_confirmed.value,
      shipping: this.shippingPayload(),
    };
  }

  private selectedCapacity(): SelectedBuyerCapacity {
    const capacity = this.capacity();
    if (!capacity) throw new Error('Buyer capacity is required.');
    return capacity;
  }

  private shippingPayload(): ShippingSelectionPayload {
    const values = this.form.getRawValue();
    return {
      shipping_option_id: values.shipping_option_id,
      recipient_name: values.recipient_name,
      address_line_1: values.address_line_1,
      address_line_2: values.address_line_2,
      postal_code: values.postal_code,
      city: values.city,
      country: values.country,
    };
  }

  private completeOrderCreation(orderId: number): void {
    this.createdOrderId.set(orderId);
    this.form.controls.buyer_capacity.disable();
    this.form.controls.withdrawal_cost_notice_confirmed.disable();
  }

  private setCheckoutData(data: CheckoutData): void {
    this.listing.set(data.listing);
    this.shippingOptions.set(data.shippingOptions);
    if (!data.shippingOptions.length) return this.failLoading();
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
