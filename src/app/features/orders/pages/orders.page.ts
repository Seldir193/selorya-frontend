import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order, OrderItem, PaymentProvider } from '../../../core/models/order.model';
import { I18nService } from '../../../core/services/i18n.service';
import { OrdersService } from '../../../core/services/orders.service';
import { formatDisplayDate, formatMoney } from '../../../core/utils/format.utils';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './orders.page.html',
  styleUrl: './orders.page.scss',
})
export class OrdersPage {
  private readonly ordersService = inject(OrdersService);
  private readonly i18n = inject(I18nService);

  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(true);

  constructor() {
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersService.list().subscribe({
      next: (orders) => this.setOrders(orders),
      error: () => this.clearOrders(),
    });
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  statusLabel(status: string): string {
    return this.text(`ordersStatus${this.toPascalCase(status)}`);
  }

  paymentProviderLabel(provider: PaymentProvider | null): string {
    if (!provider) {
      return this.text('ordersPaymentProviderMissing');
    }

    return this.text(`ordersPaymentProvider${this.toPascalCase(provider)}`);
  }

  paymentStatusLabel(status: string | null): string {
    if (!status) {
      return this.text('ordersPaymentStatusMissing');
    }

    return this.text(`ordersPaymentStatus${this.toPascalCase(status)}`);
  }

  orderDate(order: Order): string {
    return formatDisplayDate(order.created_at, this.i18n.current());
  }

  orderTotal(order: Order): string {
    return formatMoney(order.total_amount, order.currency, this.i18n.current());
  }

  itemTotal(item: OrderItem, currency: string): string {
    return formatMoney(item.line_total, currency, this.i18n.current());
  }

  private setOrders(orders: Order[]): void {
    this.orders.set(orders);
    this.stopLoading();
  }

  private clearOrders(): void {
    this.orders.set([]);
    this.stopLoading();
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
