import { Component, input, output } from '@angular/core';
import { Order, OrderItem, PaymentProvider } from '../../../../core/models/order.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { formatDisplayDate, formatMoney } from '../../../../core/utils/format.utils';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [DialogComponent],
  templateUrl: './order-detail-dialog.component.html',
  styleUrl: './order-detail-dialog.component.scss',
})
export class OrderDetailDialogComponent {
  readonly isOpen = input.required<boolean>();
  readonly order = input.required<Order | null>();
  readonly close = output<void>();

  constructor(private readonly i18n: I18nService) {}

  title(): string {
    return `${this.text('ordersDetailTitle')} #${this.order()?.id ?? ''}`;
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  closeDialog(): void {
    this.close.emit();
  }

  orderDate(): string {
    return formatDisplayDate(this.order()?.created_at ?? '', this.i18n.current());
  }

  orderTotal(): string {
    const order = this.order();
    return order ? formatMoney(order.total_amount, order.currency, this.i18n.current()) : '';
  }

  itemTotal(item: OrderItem): string {
    const currency = this.order()?.currency ?? 'EUR';
    return formatMoney(item.line_total, currency, this.i18n.current());
  }

  statusLabel(): string {
    return this.text(`ordersStatus${this.toPascalCase(this.order()?.status ?? 'unknown')}`);
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
}
