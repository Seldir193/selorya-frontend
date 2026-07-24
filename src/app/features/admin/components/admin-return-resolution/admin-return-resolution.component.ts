import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Order } from '../../../../core/models/order.model';
import {
  ShipmentReturnDecision,
  ShipmentReturnDecisionPayload,
  ShipmentReturnShippingPayer,
  ShipmentReturnStatus,
} from '../../../../core/models/return.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { OrdersService } from '../../../../core/services/orders.service';
import { ReturnsService } from '../../../../core/services/returns.service';
import { formatDisplayDate } from '../../../../core/utils/format.utils';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import {
  DropdownComponent,
  DropdownOption,
} from '../../../../shared/components/dropdown/dropdown.component';

type AdminReturnAction = 'resolve' | 'refund';
type DecisionFormValue = {
  note: string;
  shipping_payer: ShipmentReturnShippingPayer | '';
  carrier: string;
  label_reference: string;
};

@Component({
  selector: 'app-admin-return-resolution',
  standalone: true,
  imports: [ReactiveFormsModule, DialogComponent, DropdownComponent],
  templateUrl: './admin-return-resolution.component.html',
  styleUrl: './admin-return-resolution.component.scss',
})
export class AdminReturnResolutionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly ordersService = inject(OrdersService);
  private readonly returnsService = inject(ReturnsService);

  readonly order = input.required<Order>();
  readonly changed = output<void>();
  readonly decision = signal<ShipmentReturnDecision>('approved');
  readonly decisionOpen = signal(false);
  readonly refundOpen = signal(false);
  readonly activeAction = signal<AdminReturnAction | null>(null);
  readonly actionError = signal<AdminReturnAction | null>(null);
  readonly shippingPayers: Array<ShipmentReturnShippingPayer | ''> = [
    '',
    'buyer',
    'seller',
    'platform',
    'undecided',
  ];
  readonly shippingPayerOptions = computed<
    DropdownOption<ShipmentReturnShippingPayer | ''>[]
  >(() => {
    return this.shippingPayers.map((payer) => ({
      value: payer,
      label: this.payerLabel(payer),
    }));
  });
  readonly decisionForm = this.fb.nonNullable.group({
    note: ['', [Validators.required, Validators.maxLength(1000)]],
    shipping_payer: ['' as ShipmentReturnShippingPayer | ''],
    carrier: ['', Validators.maxLength(20)],
    label_reference: ['', Validators.maxLength(180)],
  });

  openDecision(decision: ShipmentReturnDecision): void {
    this.decision.set(decision);
    this.decisionForm.reset({ note: '', shipping_payer: '', carrier: '', label_reference: '' });
    this.actionError.set(null);
    this.decisionOpen.set(true);
  }

  closeDecision(): void {
    if (!this.activeAction()) this.decisionOpen.set(false);
  }

  submitDecision(): void {
    const returnRequest = this.order().shipment?.return_request;
    if (!returnRequest || this.decisionForm.invalid)
      return this.decisionForm.markAllAsTouched();
    this.startAction('resolve');
    this.returnsService.resolveReturn(returnRequest.id, this.decisionPayload()).subscribe({
      next: () => this.completeDecision(),
      error: () => this.failAction('resolve'),
    });
  }

  updateShippingPayer(payer: ShipmentReturnShippingPayer | ''): void {
    this.decisionForm.controls.shipping_payer.setValue(payer);
  }

  openRefund(): void {
    this.actionError.set(null);
    this.refundOpen.set(true);
  }

  closeRefund(): void {
    if (!this.activeAction()) this.refundOpen.set(false);
  }

  confirmRefund(): void {
    const paymentId = this.order().payment_id;
    if (!paymentId || !this.canRefund()) return;
    this.startAction('refund');
    this.ordersService.refundPayment(paymentId).subscribe({
      next: () => this.completeRefund(),
      error: () => this.failAction('refund'),
    });
  }

  canResolve(): boolean {
    return this.returnStatus() === 'requested' && !this.activeAction();
  }

  canRefund(): boolean {
    return Boolean(
      this.order().payment_id &&
        this.returnStatus() === 'return_delivered' &&
        !this.activeAction(),
    );
  }

  statusLabel(status: ShipmentReturnStatus): string {
    return this.text(`returnStatus${this.toPascalCase(status)}`);
  }

  sellerTypeLabel(): string {
    const sellerType = this.order().items[0]?.seller_type_snapshot ?? 'private';
    return this.text(`returnSellerType${this.toPascalCase(sellerType)}`);
  }

  reasonLabel(): string {
    const reason = this.order().shipment?.return_request?.reason ?? 'other';
    return this.text(`returnReason${this.toPascalCase(reason)}`);
  }

  payerLabel(payer: ShipmentReturnShippingPayer | ''): string {
    return payer ? this.text(`returnPayer${this.toPascalCase(payer)}`) : this.text('returnPayerDefault');
  }

  payoutBlockLabel(): string {
    const reason = this.order().shipment?.payout_block_reason || 'none';
    return this.text(`payoutBlock${this.toPascalCase(reason)}`);
  }

  paymentStatusLabel(): string {
    const status = this.order().payment_status || 'missing';
    return this.text(`ordersPaymentStatus${this.toPascalCase(status)}`);
  }

  requestedAt(): string {
    return this.formatDate(this.order().shipment?.return_request?.requested_at);
  }

  returnDeadline(): string {
    return this.formatDate(this.order().shipment?.return_deadline);
  }

  returnStatus(): ShipmentReturnStatus | null {
    return this.order().shipment?.return_request?.status ?? null;
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private decisionPayload(): ShipmentReturnDecisionPayload {
    const values = this.decisionForm.getRawValue();
    const payload: ShipmentReturnDecisionPayload = {
      decision: this.decision(),
      note: values.note.trim(),
    };
    if (this.decision() === 'approved') this.addApprovalFields(payload, values);
    return payload;
  }

  private addApprovalFields(
    payload: ShipmentReturnDecisionPayload,
    values: DecisionFormValue,
  ): void {
    if (values.shipping_payer) payload.shipping_payer = values.shipping_payer;
    if (values.carrier.trim()) payload.carrier = values.carrier.trim();
    if (values.label_reference.trim()) payload.label_reference = values.label_reference.trim();
  }

  private startAction(action: AdminReturnAction): void {
    this.activeAction.set(action);
    this.actionError.set(null);
  }

  private completeDecision(): void {
    this.decisionOpen.set(false);
    this.completeAction();
  }

  private completeRefund(): void {
    this.refundOpen.set(false);
    this.completeAction();
  }

  private completeAction(): void {
    this.activeAction.set(null);
    this.changed.emit();
  }

  private failAction(action: AdminReturnAction): void {
    this.activeAction.set(null);
    this.actionError.set(action);
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
