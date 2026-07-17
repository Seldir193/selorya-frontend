import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentItem, PaymentScope, PaymentStatus } from '../../../core/models/payment.model';
import { I18nService } from '../../../core/services/i18n.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { formatDisplayDateOnly, formatMoney } from '../../../core/utils/format.utils';
import {
  DropdownComponent,
  DropdownOption,
} from '../../../shared/components/dropdown/dropdown.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

type PaymentStatusFilter = 'all' | PaymentStatus;

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [RouterLink, DropdownComponent, PaginationComponent],
  templateUrl: './payments.page.html',
  styleUrl: './payments.page.scss',
})
export class PaymentsPage {
  private readonly paymentsService = inject(PaymentsService);
  private readonly i18n = inject(I18nService);

  readonly payments = signal<PaymentItem[]>([]);
  readonly isLoading = signal(true);
  readonly activeScope = signal<PaymentScope>('purchased');
  readonly searchQuery = signal('');
  readonly statusFilter = signal<PaymentStatusFilter>('all');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly paymentScopes: PaymentScope[] = ['purchased', 'sold', 'all'];
  readonly pageSizeOptions = [10, 20, 50, 100];
  readonly statusFilters: PaymentStatusFilter[] = [
    'all',
    'pending',
    'authorized',
    'paid',
    'failed',
    'cancelled',
    'refunded',
    'partially_refunded',
  ];

  readonly statusOptions = computed<DropdownOption<PaymentStatusFilter>[]>(() => {
    return this.statusFilters.map((status) => ({ value: status, label: this.statusLabel(status) }));
  });

  readonly filteredPayments = computed(() => {
    return this.payments().filter((payment) => this.matchesFilters(payment));
  });

  readonly paginatedPayments = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredPayments().slice(start, start + this.pageSize());
  });

  constructor() {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading.set(true);
    this.paymentsService.list(this.activeScope()).subscribe({
      next: (payments) => this.setPayments(payments),
      error: () => this.setPayments([]),
    });
  }

  changeScope(scope: PaymentScope): void {
    if (scope === this.activeScope()) return;
    this.activeScope.set(scope);
    this.resetPage();
    this.loadPayments();
  }

  updateSearch(value: string): void {
    this.searchQuery.set(value);
    this.resetPage();
  }

  changeStatus(status: PaymentStatusFilter): void {
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

  scopeLabel(scope: PaymentScope): string {
    return this.text(`paymentsScope${this.toPascalCase(scope)}`);
  }

  statusLabel(status: PaymentStatusFilter): string {
    return this.text(`paymentsStatus${this.toPascalCase(status)}`);
  }

  providerLabel(payment: PaymentItem): string {
    return this.text(`paymentsProvider${this.toPascalCase(payment.provider)}`);
  }

  paymentDate(payment: PaymentItem): string {
    return formatDisplayDateOnly(payment.paid_at || payment.created_at, this.i18n.current());
  }

  paymentAmount(payment: PaymentItem): string {
    return formatMoney(payment.amount, payment.currency, this.i18n.current());
  }

  hasActiveFilters(): boolean {
    return Boolean(this.searchQuery().trim() || this.statusFilter() !== 'all');
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private matchesFilters(payment: PaymentItem): boolean {
    return this.matchesStatus(payment) && this.matchesSearch(payment);
  }

  private matchesStatus(payment: PaymentItem): boolean {
    const status = this.statusFilter();
    return status === 'all' || payment.status === status;
  }

  private matchesSearch(payment: PaymentItem): boolean {
    const query = this.searchQuery().trim().toLowerCase();
    return !query || this.searchableText(payment).includes(query);
  }

  private searchableText(payment: PaymentItem): string {
    return [payment.id, payment.order_id, payment.provider, payment.status, payment.buyer_email]
      .join(' ')
      .toLowerCase();
  }

  private setPayments(payments: PaymentItem[]): void {
    this.payments.set(payments);
    this.isLoading.set(false);
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
