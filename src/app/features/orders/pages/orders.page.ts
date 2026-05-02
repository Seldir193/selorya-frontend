import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order, OrderItem, OrderScope, PaymentProvider } from '../../../core/models/order.model';
import { I18nService } from '../../../core/services/i18n.service';
import { OrdersService } from '../../../core/services/orders.service';
import { formatDisplayDate, formatMoney } from '../../../core/utils/format.utils';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

type OrderStatusFilter =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'cancelled'
  | 'refunded'
  | 'completed';

type OrderSortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'az' | 'za';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [RouterLink, PaginationComponent],
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

  readonly searchQuery = signal('');
  readonly statusFilter = signal<OrderStatusFilter>('all');
  readonly sortOption = signal<OrderSortOption>('newest');
  readonly isStatusMenuOpen = signal(false);
  readonly isSortMenuOpen = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = [10, 20, 50, 100];

  readonly statusFilters: OrderStatusFilter[] = [
    'all',
    'pending',
    'confirmed',
    'paid',
    'cancelled',
    'refunded',
    'completed',
  ];

  readonly sortOptions: OrderSortOption[] = ['newest', 'oldest', 'highest', 'lowest', 'az', 'za'];

  readonly filteredOrders = computed(() => {
    const filteredOrders = this.filterOrders(this.orders());
    return this.sortOrders(filteredOrders);
  });

  readonly paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredOrders().slice(start, end);
  });

  readonly hasActiveFilters = computed(() => {
    return (
      this.searchQuery().trim() !== '' ||
      this.statusFilter() !== 'all' ||
      this.sortOption() !== 'newest'
    );
  });

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
    this.resetPage();
    this.loadOrders();
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
    this.resetPage();
  }

  changeStatusFilter(value: OrderStatusFilter): void {
    this.statusFilter.set(value);
    this.resetPage();
    this.closeFilterMenus();
  }

  changeSortOption(value: OrderSortOption): void {
    this.sortOption.set(value);
    this.resetPage();
    this.closeFilterMenus();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.sortOption.set('newest');
  }

  changePage(page: number): void {
    this.currentPage.set(page);
  }

  changePageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.resetPage();
  }

  private resetPage(): void {
    this.currentPage.set(1);
  }

  @HostListener('document:click', ['$event'])
  closeMenusOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('[data-orders-dropdown]')) {
      this.closeFilterMenus();
    }
  }

  toggleStatusMenu(): void {
    this.isStatusMenuOpen.update((isOpen) => !isOpen);
    this.isSortMenuOpen.set(false);
  }

  toggleSortMenu(): void {
    this.isSortMenuOpen.update((isOpen) => !isOpen);
    this.isStatusMenuOpen.set(false);
  }

  closeFilterMenus(): void {
    this.isStatusMenuOpen.set(false);
    this.isSortMenuOpen.set(false);
  }

  scopeLabel(scope: OrderScope): string {
    return this.text(`ordersScope${this.toPascalCase(scope)}`);
  }

  statusFilterLabel(status: OrderStatusFilter): string {
    if (status === 'all') {
      return this.text('ordersStatusFilterAll');
    }

    return this.statusLabel(status);
  }

  sortLabel(option: OrderSortOption): string {
    return this.text(`ordersSort${this.toPascalCase(option)}`);
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

  private filterOrders(orders: Order[]): Order[] {
    return orders.filter((order) => {
      return this.matchesSearch(order) && this.matchesStatus(order);
    });
  }

  private matchesSearch(order: Order): boolean {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return true;
    }

    return this.searchableOrderText(order).includes(query);
  }

  private matchesStatus(order: Order): boolean {
    const status = this.statusFilter();
    return status === 'all' || order.status === status;
  }

  private searchableOrderText(order: Order): string {
    return [
      order.id,
      order.buyer_name,
      order.buyer_email,
      order.status,
      order.payment_provider,
      order.payment_status,
      ...order.items.map((item) => item.title_snapshot),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  private sortOrders(orders: Order[]): Order[] {
    const sortedOrders = [...orders];

    if (this.sortOption() === 'oldest') {
      return sortedOrders.sort((a, b) => this.compareDate(a, b));
    }

    if (this.sortOption() === 'highest') {
      return sortedOrders.sort((a, b) => this.compareTotal(b, a));
    }

    if (this.sortOption() === 'lowest') {
      return sortedOrders.sort((a, b) => this.compareTotal(a, b));
    }

    return this.sortByTextOrNewest(sortedOrders);
  }

  private sortByTextOrNewest(orders: Order[]): Order[] {
    if (this.sortOption() === 'az') {
      return orders.sort((a, b) => this.compareTitle(a, b));
    }

    if (this.sortOption() === 'za') {
      return orders.sort((a, b) => this.compareTitle(b, a));
    }

    return orders.sort((a, b) => this.compareDate(b, a));
  }

  private compareDate(first: Order, second: Order): number {
    return Date.parse(first.created_at) - Date.parse(second.created_at);
  }

  private compareTotal(first: Order, second: Order): number {
    return Number(first.total_amount) - Number(second.total_amount);
  }

  private compareTitle(first: Order, second: Order): number {
    return this.firstItemTitle(first).localeCompare(this.firstItemTitle(second));
  }

  private firstItemTitle(order: Order): string {
    return order.items[0]?.title_snapshot ?? '';
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
