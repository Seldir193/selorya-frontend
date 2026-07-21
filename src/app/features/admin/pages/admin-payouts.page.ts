import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PayoutItem, PayoutStatus } from '../../../core/models/payout.model';
import { I18nService } from '../../../core/services/i18n.service';
import { PayoutsService } from '../../../core/services/payouts.service';
import { formatDisplayDate, formatMoney } from '../../../core/utils/format.utils';
import {
  DropdownComponent,
  DropdownOption,
} from '../../../shared/components/dropdown/dropdown.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

type PayoutStatusFilter = 'all' | PayoutStatus;

@Component({
  selector: 'app-admin-payouts-page',
  standalone: true,
  imports: [ReactiveFormsModule, DropdownComponent, PaginationComponent],
  templateUrl: './admin-payouts.page.html',
  styleUrl: './admin-payouts.page.scss',
})
export class AdminPayoutsPage {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly payoutsService = inject(PayoutsService);

  readonly payouts = signal<PayoutItem[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly selectedPayout = signal<PayoutItem | null>(null);
  readonly isSaving = signal(false);
  readonly actionError = signal(false);
  readonly retryingId = signal<number | null>(null);
  readonly retryErrorId = signal<number | null>(null);
  readonly searchQuery = signal('');
  readonly statusFilter = signal<PayoutStatusFilter>('all');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = [10, 20, 50];
  readonly statusFilters: PayoutStatusFilter[] = [
    'all',
    'pending',
    'eligible',
    'processing',
    'paid',
    'failed',
    'cancelled',
  ];
  readonly referenceForm = this.fb.nonNullable.group({
    external_reference: ['', [Validators.required, Validators.maxLength(180)]],
  });

  readonly statusOptions = computed<DropdownOption<PayoutStatusFilter>[]>(() =>
    this.statusFilters.map((status) => ({ value: status, label: this.statusLabel(status) })),
  );

  readonly filteredPayouts = computed(() =>
    this.payouts().filter((payout) => this.matchesFilters(payout)),
  );

  readonly paginatedPayouts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredPayouts().slice(start, start + this.pageSize());
  });

  constructor() {
    this.loadPayouts();
  }

  loadPayouts(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.payoutsService.list().subscribe({
      next: (payouts) => this.completeLoad(payouts),
      error: () => this.failLoad(),
    });
  }

  updateSearch(value: string): void {
    this.searchQuery.set(value);
    this.resetPage();
  }

  changeStatus(status: PayoutStatusFilter): void {
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

  openMarkPaid(payout: PayoutItem): void {
    this.selectedPayout.set(payout);
    this.referenceForm.reset({ external_reference: '' });
    this.actionError.set(false);
  }

  closeDialog(): void {
    if (!this.isSaving()) this.selectedPayout.set(null);
  }

  submitMarkPaid(): void {
    const payout = this.selectedPayout();
    if (!payout || this.referenceForm.invalid) return this.referenceForm.markAllAsTouched();
    this.isSaving.set(true);
    this.actionError.set(false);
    const external_reference = this.referenceForm.controls.external_reference.value.trim();
    this.payoutsService.markPaid(payout.id, { external_reference }).subscribe({
      next: (updated) => this.completeMarkPaid(updated),
      error: () => this.failMarkPaid(),
    });
  }

  retryAutomatic(payout: PayoutItem): void {
    if (this.retryingId()) return;
    this.retryingId.set(payout.id);
    this.retryErrorId.set(null);
    this.payoutsService.retry(payout.id).subscribe({
      next: (updated) => this.completeRetry(updated),
      error: () => this.failRetry(payout.id),
    });
  }

  payoutAmount(payout: PayoutItem): string {
    return formatMoney(payout.amount, payout.currency, this.i18n.current());
  }

  payoutDate(payout: PayoutItem): string {
    return formatDisplayDate(
      payout.paid_at || payout.processing_at || payout.eligible_at || payout.created_at,
      this.i18n.current(),
    );
  }

  payoutDateLabel(payout: PayoutItem): string {
    if (payout.paid_at) return this.text('payoutsColumnPaid');
    if (payout.processing_at) return this.text('payoutsColumnProcessing');
    if (payout.eligible_at) return this.text('payoutsColumnEligible');
    return this.text('payoutsColumnCreated');
  }

  statusLabel(status: PayoutStatusFilter): string {
    return this.text(`payoutsStatus${this.toPascalCase(status)}`);
  }

  hasActiveFilters(): boolean {
    return Boolean(this.searchQuery().trim() || this.statusFilter() !== 'all');
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private completeLoad(payouts: PayoutItem[]): void {
    this.payouts.set(payouts);
    this.isLoading.set(false);
  }

  private failLoad(): void {
    this.isLoading.set(false);
    this.hasError.set(true);
  }

  private completeMarkPaid(updated: PayoutItem): void {
    this.replacePayout(updated);
    this.isSaving.set(false);
    this.selectedPayout.set(null);
  }

  private failMarkPaid(): void {
    this.isSaving.set(false);
    this.actionError.set(true);
  }

  private completeRetry(updated: PayoutItem): void {
    this.replacePayout(updated);
    this.retryingId.set(null);
  }

  private failRetry(id: number): void {
    this.retryingId.set(null);
    this.retryErrorId.set(id);
  }

  private replacePayout(updated: PayoutItem): void {
    this.payouts.update((items) =>
      items.map((payout) => (payout.id === updated.id ? updated : payout)),
    );
  }

  private matchesFilters(payout: PayoutItem): boolean {
    return this.matchesStatus(payout) && this.matchesSearch(payout);
  }

  private matchesStatus(payout: PayoutItem): boolean {
    return this.statusFilter() === 'all' || payout.status === this.statusFilter();
  }

  private matchesSearch(payout: PayoutItem): boolean {
    const query = this.searchQuery().trim().toLowerCase();
    return !query || this.searchableText(payout).includes(query);
  }

  private searchableText(payout: PayoutItem): string {
    return [
      payout.id,
      payout.order_id,
      payout.seller_email,
      payout.external_reference,
      payout.status,
    ]
      .join(' ')
      .toLowerCase();
  }

  private resetPage(): void {
    this.currentPage.set(1);
  }

  private toPascalCase(value: string): string {
    return value
      .split('_')
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join('');
  }
}
