import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { Order } from '../../../core/models/order.model';
import { OrdersService } from '../../../core/services/orders.service';
import { PaymentItem, PaymentsService } from '../../../core/services/payments.service';

@Component({
  selector: 'app-checkout-success-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './checkout-success.page.html',
  styleUrls: ['./checkout-success.page.scss'],
})
export class CheckoutSuccessPage {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentsService = inject(PaymentsService);
  private readonly ordersService = inject(OrdersService);
  private readonly i18n = inject(I18nService);

  readonly isLoading = signal(true);
  readonly order = signal<Order | null>(null);
  readonly provider = signal('');
  readonly sessionId = signal('');
  readonly paypalToken = signal('');

  readonly orderId = computed(() => this.order()?.id ?? null);
  readonly firstItem = computed(() => this.order()?.items[0] ?? null);
  readonly itemCount = computed(() => this.order()?.items.length ?? 0);

  constructor() {
    const provider = this.route.snapshot.queryParamMap.get('provider') ?? '';
    const sessionId = this.route.snapshot.queryParamMap.get('session_id') ?? '';
    const paypalToken = this.route.snapshot.queryParamMap.get('token') ?? '';

    this.provider.set(provider);
    this.sessionId.set(sessionId);
    this.paypalToken.set(paypalToken);

    if (provider === 'stripe' && sessionId) {
      this.loadPaymentOrder(sessionId);
      return;
    }

    if (provider === 'paypal' && paypalToken) {
      this.capturePayPalPayment(paypalToken);
      return;
    }

    this.isLoading.set(false);
  }

  private loadPaymentOrder(reference: string): void {
    this.paymentsService.findPaymentByReference(reference).subscribe({
      next: (payments) => this.handlePaymentLookup(payments, reference),
      error: () => this.stopLoading(),
    });
  }

  private handlePaymentLookup(payments: PaymentItem[], reference: string): void {
    const payment = this.findPayment(payments, reference);

    if (!payment) {
      this.stopLoading();
      return;
    }

    this.loadOrder(payment.order_id);
  }

  private capturePayPalPayment(reference: string): void {
    this.paymentsService.findPaymentByReference(reference).subscribe({
      next: (payments) => this.captureMatchingPayment(payments, reference),
      error: () => this.stopLoading(),
    });
  }

  private captureMatchingPayment(payments: PaymentItem[], reference: string): void {
    const payment = this.findPayment(payments, reference);

    if (!payment) {
      this.stopLoading();
      return;
    }

    this.capturePayment(payment);
  }

  private capturePayment(payment: PaymentItem): void {
    this.paymentsService.capturePayPal(payment.id).subscribe({
      next: () => this.loadOrder(payment.order_id),
      error: () => this.stopLoading(),
    });
  }

  private findPayment(payments: PaymentItem[], reference: string): PaymentItem | undefined {
    return payments.find((item) => item.external_reference === reference);
  }

  private loadOrder(orderId: number): void {
    this.ordersService.detail(orderId).subscribe({
      next: (order) => this.setOrder(order),
      error: () => this.stopLoading(),
    });
  }

  private setOrder(order: Order): void {
    this.order.set(order);
    this.isLoading.set(false);
  }

  providerLabel(): string {
    const currentProvider = this.provider();

    if (currentProvider === 'stripe') {
      return this.text('checkoutProviderStripe');
    }

    if (currentProvider === 'paypal') {
      return this.text('checkoutProviderPaypal');
    }

    return this.text('checkoutProviderUnknown');
  }

  statusLabel(): string {
    const status = this.order()?.status ?? 'unknown';
    return this.text(`checkoutStatus${this.toPascalCase(status)}`);
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private toPascalCase(value: string): string {
    return value
      .split('_')
      .filter(Boolean)
      .map((part) => this.capitalize(part))
      .join('');
  }

  private capitalize(value: string): string {
    return value[0].toUpperCase() + value.slice(1);
  }
  private stopLoading(): void {
    this.isLoading.set(false);
  }
}
