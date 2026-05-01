import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersService } from '../../../core/services/orders.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { Order } from '../../../core/models/order.model';

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

  readonly isLoading = signal(true);
  readonly order = signal<Order | null>(null);
  readonly provider = signal('');
  readonly sessionId = signal('');
  readonly paypalToken = signal('');

  readonly orderId = computed(() => this.order()?.id ?? null);

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
      error: () => this.isLoading.set(false),
    });
  }

  private handlePaymentLookup(payments: any[], reference: string): void {
    const payment = payments.find((item) => item.external_reference === reference);

    if (!payment) {
      this.isLoading.set(false);
      return;
    }

    this.loadOrder(payment.order_id);
  }

  private capturePayPalPayment(reference: string): void {
    this.paymentsService.findPaymentByReference(reference).subscribe({
      next: (payments) => this.captureMatchingPayment(payments, reference),
      error: () => this.isLoading.set(false),
    });
  }

  private captureMatchingPayment(payments: any[], reference: string): void {
    const payment = payments.find((item) => item.external_reference === reference);

    if (!payment) {
      this.isLoading.set(false);
      return;
    }

    this.paymentsService.capturePayPal(payment.id).subscribe({
      next: () => this.loadOrder(payment.order_id),
      error: () => this.isLoading.set(false),
    });
  }

  private loadOrder(orderId: number): void {
    this.ordersService.detail(orderId).subscribe({
      next: (order) => this.setOrder(order),
      error: () => this.isLoading.set(false),
    });
  }

  private setOrder(order: Order): void {
    this.order.set(order);
    this.isLoading.set(false);
  }
}
