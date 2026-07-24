import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Order, OrderScope, SellerType } from '../../../../core/models/order.model';
import {
  ShipmentReturnReason,
  ShipmentReturnStatus,
} from '../../../../core/models/return.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { ReturnsService } from '../../../../core/services/returns.service';
import { formatDisplayDate } from '../../../../core/utils/format.utils';
import {
  DropdownComponent,
  DropdownOption,
} from '../../../../shared/components/dropdown/dropdown.component';

type ReturnAction = 'request' | 'ship' | 'confirm';
const RETURN_REASONS: ShipmentReturnReason[] = [
  'change_of_mind',
  'defective',
  'not_as_described',
  'wrong_item',
  'damaged',
  'counterfeit',
  'other',
];

@Component({
  selector: 'app-return-panel',
  standalone: true,
  imports: [DropdownComponent],
  templateUrl: './return-panel.component.html',
  styleUrl: './return-panel.component.scss',
})
export class ReturnPanelComponent {
  private readonly i18n = inject(I18nService);
  private readonly returnsService = inject(ReturnsService);

  readonly order = input.required<Order>();
  readonly scope = input.required<OrderScope>();
  readonly changed = output<void>();
  readonly requestOpen = signal(false);
  readonly reason = signal<ShipmentReturnReason>('defective');
  readonly description = signal('');
  readonly carrier = signal('');
  readonly trackingNumber = signal('');
  readonly activeAction = signal<ReturnAction | null>(null);
  readonly failedAction = signal<ReturnAction | null>(null);

  readonly availableReasons = computed(() => {
    return RETURN_REASONS.filter((reason) => this.reasonAllowed(reason));
  });

  readonly reasonOptions = computed<DropdownOption<ShipmentReturnReason>[]>(() => {
    return this.availableReasons().map((reason) => ({
      value: reason,
      label: this.reasonLabel(reason),
    }));
  });

  openRequest(): void {
    this.reason.set(this.availableReasons()[0] ?? 'defective');
    this.description.set('');
    this.failedAction.set(null);
    this.requestOpen.set(true);
  }

  closeRequest(): void {
    if (!this.activeAction()) this.requestOpen.set(false);
  }

  requestReturn(): void {
    const shipment = this.order().shipment;
    if (!shipment || !this.canRequest() || !this.canSubmitRequest()) return;
    this.startAction('request');
    const payload = { reason: this.reason(), description: this.description().trim() };
    this.returnsService.requestReturn(shipment.id, payload).subscribe({
      next: () => this.completeRequest(),
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

  canSubmitRequest(): boolean {
    return this.reason() === 'change_of_mind' || Boolean(this.description().trim());
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

  sellerType(): SellerType {
    return this.order().items[0]?.seller_type_snapshot ?? 'private';
  }

  reasonLabel(reason: ShipmentReturnReason): string {
    return this.text(`returnReason${this.toPascalCase(reason)}`);
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

  returnStatus(): ShipmentReturnStatus | null {
    return this.order().shipment?.return_request?.status ?? null;
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private reasonAllowed(reason: ShipmentReturnReason): boolean {
    return reason !== 'change_of_mind' || this.sellerType() === 'commercial';
  }

  private startAction(action: ReturnAction): void {
    this.activeAction.set(action);
    this.failedAction.set(null);
  }

  private completeRequest(): void {
    this.requestOpen.set(false);
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
