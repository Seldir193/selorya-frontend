import { Component, computed, inject, signal } from '@angular/core';
import {
  Order,
  OrderScope,
  Shipment,
  ShipmentIssueCategory,
  ShipmentIssueResolutionStatus,
} from '../../../core/models/order.model';
import { I18nService } from '../../../core/services/i18n.service';
import { OrdersService } from '../../../core/services/orders.service';
import {
  formatDisplayDate,
  formatDisplayDateOnly,
  formatMoney,
} from '../../../core/utils/format.utils';
import {
  DropdownComponent,
  DropdownOption,
} from '../../../shared/components/dropdown/dropdown.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { OrderDetailDialogComponent } from '../../orders/components/order-detail-dialog/order-detail-dialog.component';
import { ReturnPanelComponent } from '../components/return-panel/return-panel.component';
import {
  ORDER_SCOPES,
  PAGE_SIZE_OPTIONS,
  SHIPMENT_ISSUE_CATEGORIES,
  SHIPMENT_STATUS_FILTERS,
  ShipmentStatusFilter,
} from './shipping.constants';

type ShipmentOrder = Order & { shipment: Shipment };

@Component({
  selector: 'app-shipping-page',
  standalone: true,
  imports: [
    DropdownComponent,
    PaginationComponent,
    OrderDetailDialogComponent,
    ReturnPanelComponent,
  ],
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
  readonly trackingValues = signal<Record<number, string>>({});
  readonly savingShipmentId = signal<number | null>(null);
  readonly dispatchErrorId = signal<number | null>(null);
  readonly confirmingShipmentId = signal<number | null>(null);
  readonly confirmationErrorId = signal<number | null>(null);
  readonly issueFormId = signal<number | null>(null);
  readonly issueCategory = signal<ShipmentIssueCategory>('not_received');
  readonly issueDescription = signal('');
  readonly reportingIssueId = signal<number | null>(null);
  readonly issueErrorId = signal<number | null>(null);
  readonly issueResponseFormId = signal<number | null>(null);
  readonly issueResponseStatus = signal<ShipmentIssueResolutionStatus>('resolved');
  readonly issueResponseNote = signal('');
  readonly respondingIssueId = signal<number | null>(null);
  readonly issueResponseErrorId = signal<number | null>(null);
  readonly orderScopes = ORDER_SCOPES;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly statusFilters = SHIPMENT_STATUS_FILTERS;
  readonly issueCategories = SHIPMENT_ISSUE_CATEGORIES;

  readonly statusOptions = computed<DropdownOption<ShipmentStatusFilter>[]>(() =>
    this.statusFilters.map((status) => ({ value: status, label: this.statusLabel(status) })),
  );
  readonly issueCategoryOptions = computed<DropdownOption<ShipmentIssueCategory>[]>(() =>
    this.issueCategories.map((category) => ({
      value: category,
      label: this.issueCategoryLabel(category),
    })),
  );
  readonly shipmentOrders = computed(() =>
    this.orders().filter((order): order is ShipmentOrder => Boolean(order.shipment)),
  );
  readonly filteredOrders = computed(() =>
    this.shipmentOrders().filter((order) => this.matchesFilters(order)),
  );
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
    this.resetInteractionState();
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

  canDispatch(order: ShipmentOrder): boolean {
    const ready = order.status === 'paid' || order.status === 'partially_refunded';
    return this.activeScope() === 'sold' && ready && order.shipment.status === 'selected';
  }

  updateTracking(id: number, value: string): void {
    this.trackingValues.update((values) => ({ ...values, [id]: value }));
    this.dispatchErrorId.set(null);
  }

  dispatch(order: ShipmentOrder): void {
    const tracking = (this.trackingValues()[order.shipment.id] ?? '').trim();
    if (!tracking) return this.dispatchErrorId.set(order.shipment.id);
    this.savingShipmentId.set(order.shipment.id);
    this.ordersService
      .dispatchShipment(order.shipment.id, { status: 'shipped', tracking_number: tracking })
      .subscribe({
        next: (shipment) => this.completeDispatch(order.id, shipment),
        error: () => this.failDispatch(order.shipment.id),
      });
  }

  canConfirmDelivery(order: ShipmentOrder): boolean {
    return this.activeScope() === 'purchased' && order.shipment.status === 'shipped';
  }

  canReportIssue(order: ShipmentOrder): boolean {
    return !order.shipment.issue_category && !order.shipment.return_request;
  }

  canRespondIssue(order: ShipmentOrder): boolean {
    return Boolean(
      this.activeScope() === 'sold' &&
        order.shipment.issue_category &&
        order.shipment.issue_status === 'open',
    );
  }

  completionDeadline(order: ShipmentOrder): string {
    const deadline = order.shipment.auto_complete_at;
    return deadline ? formatDisplayDate(deadline, this.i18n.current()) : '';
  }

  confirmDelivery(order: ShipmentOrder): void {
    this.confirmingShipmentId.set(order.shipment.id);
    this.confirmationErrorId.set(null);
    this.ordersService.confirmDelivery(order.shipment.id).subscribe({
      next: (updated) => this.completeDelivery(updated),
      error: () => this.failDelivery(order.shipment.id),
    });
  }

  openIssueForm(order: ShipmentOrder): void {
    this.issueFormId.set(order.shipment.id);
    this.issueCategory.set('not_received');
    this.issueDescription.set('');
    this.issueErrorId.set(null);
  }

  closeIssueForm(): void {
    this.issueFormId.set(null);
    this.issueErrorId.set(null);
  }

  changeIssueCategory(category: ShipmentIssueCategory): void {
    this.issueCategory.set(category);
    this.issueErrorId.set(null);
  }

  reportIssue(order: ShipmentOrder): void {
    const description = this.issueDescription().trim();
    if (!description) return this.issueErrorId.set(order.shipment.id);
    this.reportingIssueId.set(order.shipment.id);
    const payload = { category: this.issueCategory(), description };
    this.ordersService.reportShipmentIssue(order.shipment.id, payload).subscribe({
      next: (updated) => this.completeIssueReport(updated),
      error: () => this.failIssueReport(order.shipment.id),
    });
  }

  openIssueResponse(order: ShipmentOrder, status: ShipmentIssueResolutionStatus): void {
    this.issueResponseFormId.set(order.shipment.id);
    this.issueResponseStatus.set(status);
    this.issueResponseNote.set('');
    this.issueResponseErrorId.set(null);
  }

  closeIssueResponse(): void {
    if (this.respondingIssueId()) return;
    this.issueResponseFormId.set(null);
    this.issueResponseErrorId.set(null);
  }

  respondIssue(order: ShipmentOrder): void {
    const note = this.issueResponseNote().trim();
    if (!note) return this.issueResponseErrorId.set(order.shipment.id);
    this.respondingIssueId.set(order.shipment.id);
    const payload = { status: this.issueResponseStatus(), note };
    this.ordersService.respondShipmentIssue(order.shipment.id, payload).subscribe({
      next: (updated) => this.completeIssueResponse(updated),
      error: () => this.failIssueResponse(order.shipment.id),
    });
  }

  issueCategoryLabel(category: ShipmentIssueCategory): string {
    return this.text(`shippingIssueCategory${this.toPascalCase(category)}`);
  }

  reportedIssueCategory(order: ShipmentOrder): string {
    const category = order.shipment.issue_category;
    return category ? this.issueCategoryLabel(category) : this.text('shippingIssueCategoryOther');
  }

  issueResolutionLabel(order: ShipmentOrder): string {
    const status = order.shipment.issue_status || 'open';
    return this.text(`shippingIssueResolution${this.toPascalCase(status)}`);
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
    return [order.id, shipment.service_name, shipment.carrier, shipment.tracking_number, this.itemTitle(order)]
      .join(' ')
      .toLowerCase();
  }

  private setOrders(orders: Order[]): void {
    this.orders.set(orders);
    this.isLoading.set(false);
  }

  private replaceOrder(updated: Order): void {
    this.orders.update((orders) =>
      orders.map((order) => (order.id === updated.id ? updated : order)),
    );
  }

  private completeDispatch(orderId: number, shipment: Shipment): void {
    this.orders.update((orders) =>
      orders.map((order) => (order.id === orderId ? { ...order, shipment } : order)),
    );
    this.savingShipmentId.set(null);
    this.dispatchErrorId.set(null);
  }

  private failDispatch(shipmentId: number): void {
    this.savingShipmentId.set(null);
    this.dispatchErrorId.set(shipmentId);
  }

  private completeDelivery(updated: Order): void {
    this.replaceOrder(updated);
    this.confirmingShipmentId.set(null);
  }

  private failDelivery(shipmentId: number): void {
    this.confirmingShipmentId.set(null);
    this.confirmationErrorId.set(shipmentId);
  }

  private completeIssueReport(updated: Order): void {
    this.replaceOrder(updated);
    this.reportingIssueId.set(null);
    this.issueFormId.set(null);
  }

  private failIssueReport(shipmentId: number): void {
    this.reportingIssueId.set(null);
    this.issueErrorId.set(shipmentId);
  }

  private completeIssueResponse(updated: Order): void {
    this.replaceOrder(updated);
    this.respondingIssueId.set(null);
    this.issueResponseFormId.set(null);
  }

  private failIssueResponse(shipmentId: number): void {
    this.respondingIssueId.set(null);
    this.issueResponseErrorId.set(shipmentId);
  }

  private resetInteractionState(): void {
    this.closeIssueForm();
    this.issueResponseFormId.set(null);
    this.issueResponseErrorId.set(null);
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
