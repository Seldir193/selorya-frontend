import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order, OrderItem, OrderScope, PaymentProvider } from '../../../core/models/order.model';
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
  readonly activeScope = signal<OrderScope>('purchased');
  readonly orderScopes: OrderScope[] = ['purchased', 'sold', 'all'];

  constructor() {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.ordersService.list(this.activeScope()).subscribe({
      next: (orders) => this.setOrders(orders),
      error: () => this.clearOrders(),
    });
  }

  changeScope(scope: OrderScope): void {
    if (this.activeScope() === scope) {
      return;
    }

    this.activeScope.set(scope);
    this.loadOrders();
  }

  scopeLabel(scope: OrderScope): string {
    return this.text(`ordersScope${this.toPascalCase(scope)}`);
  }

  emptyTitle(): string {
    return this.text(`ordersEmptyTitle${this.toPascalCase(this.activeScope())}`);
  }

  emptyDescription(): string {
    return this.text(`ordersEmptyDescription${this.toPascalCase(this.activeScope())}`);
  }

  contextLabel(order: Order): string {
    if (this.activeScope() === 'sold') {
      return `${this.text('ordersSoldTo')} ${order.buyer_name}`;
    }

    if (this.activeScope() === 'all') {
      return `${this.text('ordersBuyer')} ${order.buyer_name}`;
    }

    return this.text('ordersPurchasedByYou');
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
