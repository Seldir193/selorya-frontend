import { Component, computed, inject, signal } from '@angular/core';
import { Order, OrderScope, Shipment, ShipmentStatus } from '../../../core/models/order.model';
import { I18nService } from '../../../core/services/i18n.service';
import { OrdersService } from '../../../core/services/orders.service';
import { formatDisplayDateOnly, formatMoney } from '../../../core/utils/format.utils';
import {
  DropdownComponent,
  DropdownOption,
} from '../../../shared/components/dropdown/dropdown.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { OrderDetailDialogComponent } from '../../orders/components/order-detail-dialog/order-detail-dialog.component';

type ShipmentOrder = Order & { shipment: Shipment };
type ShipmentStatusFilter = 'all' | ShipmentStatus;

@Component({
  selector: 'app-shipping-page',
  standalone: true,
  imports: [DropdownComponent, PaginationComponent, OrderDetailDialogComponent],
  templateUrl: './shipping.page.html',
  styleUrl: './shipping.page.scss',
})
export class ShippingPage {
  private readonly ordersService = inject(OrdersService);
  private readonly i18n = inject(I18nService);

  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(true);
  readonly activeScope = signal<OrderScope>('purchased');
  readonly searchQuery = signal('');
  readonly statusFilter = signal<ShipmentStatusFilter>('all');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly selectedOrder = signal<Order | null>(null);
  readonly orderScopes: OrderScope[] = ['purchased', 'sold', 'all'];
  readonly pageSizeOptions = [10, 20, 50, 100];
  readonly statusFilters: ShipmentStatusFilter[] = [
    'all',
    'selection_required',
    'selected',
    'label_created',
    'shipped',
    'delivered',
    'issue_reported',
    'cancelled',
    'legacy_unknown',
  ];

  readonly statusOptions = computed<DropdownOption<ShipmentStatusFilter>[]>(() => {
    return this.statusFilters.map((status) => ({ value: status, label: this.statusLabel(status) }));
  });

  readonly shipmentOrders = computed(() => {
    return this.orders().filter((order): order is ShipmentOrder => Boolean(order.shipment));
  });

  readonly filteredOrders = computed(() => {
    return this.shipmentOrders().filter((order) => this.matchesFilters(order));
  });

  readonly paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredOrders().slice(start, start + this.pageSize());
  });

  constructor() {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.ordersService.list(this.activeScope()).subscribe({
      next: (orders) => this.setOrders(orders),
      error: () => this.setOrders([]),
    });
  }

  changeScope(scope: OrderScope): void {
    if (scope === this.activeScope()) return;
    this.activeScope.set(scope);
    this.resetPage();
    this.loadOrders();
  }

  updateSearch(value: string): void {
    this.searchQuery.set(value);
    this.resetPage();
  }

  changeStatus(status: ShipmentStatusFilter): void {
    this.statusFilter.set(status);
    this.resetPage();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.resetPage();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
  }

  changePageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.resetPage();
  }

  openDetails(order: Order): void {
    this.selectedOrder.set(order);
  }

  closeDetails(): void {
    this.selectedOrder.set(null);
  }

  scopeLabel(scope: OrderScope): string {
    return this.text(`shippingScope${this.toPascalCase(scope)}`);
  }

  statusLabel(status: ShipmentStatusFilter): string {
    if (status === 'all') return this.text('shippingStatusAll');
    return this.text(`ordersShipmentStatus${this.toPascalCase(status)}`);
  }

  itemTitle(order: Order): string {
    return order.items[0]?.title_snapshot || this.text('ordersUnknownItem');
  }

  shippingMethod(order: ShipmentOrder): string {
    const shipment = order.shipment;
    return shipment.service_name || [shipment.carrier, shipment.service_level].join(' · ');
  }

  shippingPrice(order: ShipmentOrder): string {
    const shipment = order.shipment;
    return formatMoney(shipment.shipping_amount, shipment.currency, this.i18n.current());
  }

  trackingNumber(order: ShipmentOrder): string {
    return order.shipment.tracking_number || this.text('ordersShipmentTrackingMissing');
  }

  orderDate(order: Order): string {
    return formatDisplayDateOnly(order.created_at, this.i18n.current());
  }

  hasActiveFilters(): boolean {
    return Boolean(this.searchQuery().trim() || this.statusFilter() !== 'all');
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private matchesFilters(order: ShipmentOrder): boolean {
    return this.matchesStatus(order) && this.matchesSearch(order);
  }

  private matchesStatus(order: ShipmentOrder): boolean {
    const status = this.statusFilter();
    return status === 'all' || order.shipment.status === status;
  }

  private matchesSearch(order: ShipmentOrder): boolean {
    const query = this.searchQuery().trim().toLowerCase();
    return !query || this.searchableText(order).includes(query);
  }

  private searchableText(order: ShipmentOrder): string {
    const shipment = order.shipment;
    return [
      order.id,
      shipment.service_name,
      shipment.carrier,
      shipment.tracking_number,
      this.itemTitle(order),
    ]
      .join(' ')
      .toLowerCase();
  }

  private setOrders(orders: Order[]): void {
    this.orders.set(orders);
    this.isLoading.set(false);
  }

  private resetPage(): void {
    this.currentPage.set(1);
  }

  private toPascalCase(value: string): string {
    return value
      .split('_')
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join('');
  }
}
