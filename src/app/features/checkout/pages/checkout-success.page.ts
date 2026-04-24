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

  readonly orderId = computed(() => this.order()?.id ?? null);

  constructor() {
    const provider = this.route.snapshot.queryParamMap.get('provider') ?? '';
    const sessionId = this.route.snapshot.queryParamMap.get('session_id') ?? '';

    this.provider.set(provider);
    this.sessionId.set(sessionId);

    if (provider === 'stripe' && sessionId) {
      this.loadStripeOrder(sessionId);
      return;
    }

    this.isLoading.set(false);
  }

  private loadStripeOrder(sessionId: string): void {
    this.paymentsService.findOrderBySessionId(sessionId).subscribe({
      next: (payments) => {
        const payment = payments.find((item) => item.external_reference === sessionId);
        if (!payment) {
          this.isLoading.set(false);
          return;
        }

        this.ordersService.detail(payment.order_id).subscribe({
          next: (order) => {
            this.order.set(order);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
          },
        });
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
