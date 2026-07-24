import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Order, ShipmentIssueResolutionStatus } from '../../../core/models/order.model';
import { I18nService } from '../../../core/services/i18n.service';
import { OrdersService } from '../../../core/services/orders.service';
import { formatDisplayDate } from '../../../core/utils/format.utils';
import { AdminReturnResolutionComponent } from '../components/admin-return-resolution/admin-return-resolution.component';

@Component({
  selector: 'app-admin-shipment-issues-page',
  standalone: true,
  imports: [ReactiveFormsModule, AdminReturnResolutionComponent],
  templateUrl: './admin-shipment-issues.page.html',
  styleUrl: './admin-shipment-issues.page.scss',
})
export class AdminShipmentIssuesPage {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly ordersService = inject(OrdersService);

  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly selectedOrder = signal<Order | null>(null);
  readonly refundOrder = signal<Order | null>(null);
  readonly selectedStatus = signal<ShipmentIssueResolutionStatus>('resolved');
  readonly isSaving = signal(false);
  readonly actionError = signal(false);
  readonly refundingPaymentId = signal<number | null>(null);
  readonly resolutionForm = this.fb.nonNullable.group({
    note: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  constructor() {
    this.loadIssues();
  }

  loadIssues(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.ordersService.listShipmentIssues().subscribe({
      next: (orders) => this.completeLoad(orders),
      error: () => this.failLoad(),
    });
  }

  openResolution(order: Order, status: ShipmentIssueResolutionStatus): void {
    this.selectedOrder.set(order);
    this.selectedStatus.set(status);
    this.resolutionForm.reset({ note: '' });
    this.actionError.set(false);
  }

  closeResolution(): void {
    if (!this.isSaving()) this.selectedOrder.set(null);
  }

  submitResolution(): void {
    const order = this.selectedOrder();
    if (!order?.shipment || this.resolutionForm.invalid)
      return this.resolutionForm.markAllAsTouched();
    this.isSaving.set(true);
    const payload = {
      status: this.selectedStatus(),
      note: this.resolutionForm.controls.note.value,
    };
    this.ordersService.resolveShipmentIssue(order.shipment.id, payload).subscribe({
      next: (updated) => this.completeResolution(updated),
      error: () => this.failResolution(),
    });
  }

  openRefund(order: Order): void {
    this.refundOrder.set(order);
    this.actionError.set(false);
  }

  closeRefund(): void {
    if (!this.refundingPaymentId()) this.refundOrder.set(null);
  }

  confirmRefund(): void {
    const order = this.refundOrder();
    if (!order?.payment_id) return;
    this.refundingPaymentId.set(order.payment_id);
    this.actionError.set(false);
    this.ordersService.refundPayment(order.payment_id).subscribe({
      next: () => this.completeRefund(),
      error: () => this.failRefund(),
    });
  }

  issueDate(order: Order): string {
    return formatDisplayDate(
      order.shipment?.issue_reported_at || order.updated_at,
      this.i18n.current(),
    );
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private completeLoad(orders: Order[]): void {
    this.orders.set(orders);
    this.isLoading.set(false);
  }

  private failLoad(): void {
    this.isLoading.set(false);
    this.hasError.set(true);
  }

  private completeResolution(updated: Order): void {
    this.orders.update((orders) =>
      orders.map((order) => (order.id === updated.id ? updated : order)),
    );
    this.isSaving.set(false);
    this.selectedOrder.set(null);
  }

  private failResolution(): void {
    this.isSaving.set(false);
    this.actionError.set(true);
  }

  private completeRefund(): void {
    this.refundingPaymentId.set(null);
    this.refundOrder.set(null);
    this.loadIssues();
  }

  private failRefund(): void {
    this.refundingPaymentId.set(null);
    this.actionError.set(true);
  }
}
