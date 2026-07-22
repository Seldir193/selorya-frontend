import { Component, inject, signal } from '@angular/core';
import { PayoutProviderAccount } from '../../../core/models/payout.model';
import { I18nService } from '../../../core/services/i18n.service';
import { PayoutsService } from '../../../core/services/payouts.service';

@Component({
  selector: 'app-paypal-payout-account',
  standalone: true,
  templateUrl: './paypal-payout-account.component.html',
  styleUrl: './paypal-payout-account.component.scss',
})
export class PaypalPayoutAccountComponent {
  private readonly i18n = inject(I18nService);
  private readonly payoutsService = inject(PayoutsService);

  readonly account = signal<PayoutProviderAccount | null>(null);
  readonly email = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly hasError = signal(false);

  constructor() {
    this.load();
  }

  updateEmail(value: string): void {
    this.email.set(value);
  }

  save(): void {
    if (!this.email().trim() || this.saving()) return;
    this.saving.set(true);
    this.hasError.set(false);
    this.payoutsService.savePaypalAccount({ email: this.email().trim() }).subscribe({
      next: (account) => this.complete(account),
      error: () => this.fail(),
    });
  }

  deactivate(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.hasError.set(false);
    this.payoutsService.deactivatePaypalAccount().subscribe({
      next: (account) => this.complete(account),
      error: () => this.fail(),
    });
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private load(): void {
    this.payoutsService.paypalAccount().subscribe({
      next: (account) => this.completeLoad(account),
      error: () => this.failLoad(),
    });
  }

  private completeLoad(account: PayoutProviderAccount): void {
    this.account.set(account);
    this.email.set(account.destination);
    this.loading.set(false);
  }

  private failLoad(): void {
    this.loading.set(false);
    this.hasError.set(true);
  }

  private complete(account: PayoutProviderAccount): void {
    this.account.set(account);
    this.email.set(account.destination);
    this.saving.set(false);
  }

  private fail(): void {
    this.saving.set(false);
    this.hasError.set(true);
  }
}
