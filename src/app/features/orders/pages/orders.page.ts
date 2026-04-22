import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrdersService } from '../../../core/services/orders.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './orders.page.html',
  styleUrl: './orders.page.scss',
})
export class OrdersPage {
  private readonly ordersService = inject(OrdersService);

  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(true);

  constructor() {
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersService.list().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: () => {
        this.orders.set([]);
        this.isLoading.set(false);
      },
    });
  }
}
