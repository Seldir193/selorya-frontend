import { Component, inject, input, output, signal } from '@angular/core';
import { Order, OrderScope } from '../../../../core/models/order.model';
import { ShipmentReturnStatus } from '../../../../core/models/return.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { ReturnsService } from '../../../../core/services/returns.service';
import { formatDisplayDate } from '../../../../core/utils/format.utils';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';


type ReturnAction = 'request' | 'ship' | 'confirm';

@Component({
  selector: 'app-return-panel',
  standalone: true,
  imports: [DialogComponent],
  templateUrl: './return-panel.component.html',
  styleUrl: './return-panel.component.scss',
})
export class ReturnPanelComponent {
  private readonly i18n = inject(I18nService);
  private readonly returnsService = inject(ReturnsService);

  readonly order = input.required<Order>();
  readonly scope = input.required<OrderScope>();
  readonly changed = output<void>();
  readonly withdrawalOpen = signal(false);
  readonly carrier = signal('');
  readonly trackingNumber = signal('');
  readonly activeAction = signal<ReturnAction | null>(null);
  readonly failedAction = signal<ReturnAction | null>(null);

  openWithdrawal(): void {
    this.failedAction.set(null);
    this.withdrawalOpen.set(true);
  }

  closeWithdrawal(): void {
    if (!this.activeAction()) this.withdrawalOpen.set(false);
  }

  confirmWithdrawal(): void {
    const shipment = this.order().shipment;
    if (!shipment || !this.canRequest()) return;
    this.startAction('request');
    const payload = { reason: 'change_of_mind' as const, description: '' };
    this.returnsService.requestReturn(shipment.id, payload).subscribe({
      next: () => this.completeWithdrawal(),
      error: () => this.failAction('request'),
    });
  }

  shipReturn(): void {
    const returnRequest = this.order().shipment?.return_request;
    const carrier = this.carrier().trim();
    const tracking_number = this.trackingNumber().trim();
    if (!returnRequest || !carrier || !tracking_number || !this.canShip()) return;
    this.startAction('ship');
    this.returnsService.shipReturn(returnRequest.id, { carrier, tracking_number }).subscribe({
      next: () => this.completeAction(),
      error: () => this.failAction('ship'),
    });
  }

  confirmDelivery(): void {
    const returnRequest = this.order().shipment?.return_request;
    if (!returnRequest || !this.canConfirm()) return;
    this.startAction('confirm');
    this.returnsService.confirmReturnDelivery(returnRequest.id).subscribe({
      next: () => this.completeAction(),
      error: () => this.failAction('confirm'),
    });
  }

  canRequest(): boolean {
    const shipment = this.order().shipment;
    return Boolean(
      this.scope() === 'purchased' &&
        shipment?.return_allowed &&
        !shipment.return_request &&
        !shipment.issue_category &&
        !this.activeAction(),
    );
  }

  canShip(): boolean {
    const status = this.returnStatus();
    return this.scope() === 'purchased' && ['approved', 'label_created'].includes(status ?? '');
  }

  canConfirm(): boolean {
    return this.scope() === 'sold' && this.returnStatus() === 'return_shipped';
  }

  isReadOnly(): boolean {
    return this.scope() === 'all';
  }

  isVisible(): boolean {
    const shipment = this.order().shipment;
    if (!shipment) return false;
    if (shipment.return_request) return true;
    if (this.scope() === 'sold') return Boolean(shipment.payout_eligible_at || shipment.payout_blocked);
    return this.scope() === 'purchased' && ['shipped', 'delivered'].includes(shipment.status);
  }

  statusLabel(status: ShipmentReturnStatus): string {
    return this.text(`returnStatus${this.toPascalCase(status)}`);
  }

  statusHint(status: ShipmentReturnStatus): string {
    return this.text(`returnStatusHint${this.toPascalCase(status)}`);
  }

  payerLabel(): string {
    const payer = this.order().shipment?.return_request?.shipping_payer ?? 'undecided';
    return this.text(`returnPayer${this.toPascalCase(payer)}`);
  }

  payoutBlockLabel(): string {
    const reason = this.order().shipment?.payout_block_reason || 'none';
    return this.text(`payoutBlock${this.toPascalCase(reason)}`);
  }

  returnDeadline(): string {
    return this.formatDate(this.order().shipment?.return_deadline);
  }

  payoutEligibleAt(): string {
    return this.formatDate(this.order().shipment?.payout_eligible_at);
  }

  requestedAt(): string {
    return this.formatDate(this.order().shipment?.return_request?.requested_at);
  }

  carrierAcceptedAt(): string {
    return this.formatDate(this.order().shipment?.return_request?.carrier_accepted_at);
  }

  returnStatus(): ShipmentReturnStatus | null {
    return this.order().shipment?.return_request?.status ?? null;
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private startAction(action: ReturnAction): void {
    this.activeAction.set(action);
    this.failedAction.set(null);
  }

  private completeWithdrawal(): void {
    this.withdrawalOpen.set(false);
    this.completeAction();
  }

  private completeAction(): void {
    this.activeAction.set(null);
    this.changed.emit();
  }

  private failAction(action: ReturnAction): void {
    this.activeAction.set(null);
    this.failedAction.set(action);
  }

  private formatDate(value: string | null | undefined): string {
    return value ? formatDisplayDate(value, this.i18n.current()) : this.text('returnNotAvailable');
  }

  private toPascalCase(value: string): string {
    return value
      .split('_')
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join('');
  }
}
