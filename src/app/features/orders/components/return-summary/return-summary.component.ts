import { Component, inject, input } from '@angular/core';
import { Order } from '../../../../core/models/order.model';
import { ShipmentReturnStatus } from '../../../../core/models/return.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { formatDisplayDate } from '../../../../core/utils/format.utils';

@Component({
  selector: 'app-return-summary',
  standalone: true,
  templateUrl: './return-summary.component.html',
  styleUrl: './return-summary.component.scss',
})
export class ReturnSummaryComponent {
  private readonly i18n = inject(I18nService);
  readonly order = input.required<Order>();

  hasContext(): boolean {
    const shipment = this.order().shipment;
    return Boolean(shipment?.return_deadline || shipment?.return_request);
  }

  sellerTypeLabel(): string {
    const sellerType = this.order().items[0]?.seller_type_snapshot ?? 'private';
    return this.text(`returnSellerType${this.toPascalCase(sellerType)}`);
  }

  deadline(): string {
    return this.formatDate(this.order().shipment?.return_deadline);
  }

  payoutEligibleAt(): string {
    return this.formatDate(this.order().shipment?.payout_eligible_at);
  }

  statusLabel(status: ShipmentReturnStatus): string {
    return this.text(`returnStatus${this.toPascalCase(status)}`);
  }

  reasonLabel(): string {
    const reason = this.order().shipment?.return_request?.reason ?? 'other';
    return this.text(`returnReason${this.toPascalCase(reason)}`);
  }

  payerLabel(): string {
    const payer = this.order().shipment?.return_request?.shipping_payer ?? 'undecided';
    return this.text(`returnPayer${this.toPascalCase(payer)}`);
  }

  refundStatus(): string {
    const status = this.order().shipment?.return_request?.status;
    return status ? this.statusLabel(status) : this.text('returnNotRequested');
  }

  text(key: string): string {
    return this.i18n.t(key);
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
