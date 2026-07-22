import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocumentItem } from '../../../core/models/document.model';
import {
  PayoutItem,
  PayoutOnboardingStatus,
  PayoutStatus,
} from '../../../core/models/payout.model';
import { DocumentsService } from '../../../core/services/documents.service';
import { I18nService } from '../../../core/services/i18n.service';
import { PayoutsService } from '../../../core/services/payouts.service';
import { formatDisplayDate, formatMoney } from '../../../core/utils/format.utils';
import {
  DropdownComponent,
  DropdownOption,
} from '../../../shared/components/dropdown/dropdown.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PaypalPayoutAccountComponent } from '../components/paypal-payout-account.component';

type PayoutStatusFilter = 'all' | PayoutStatus;

@Component({
  selector: 'app-payouts-page',
  standalone: true,
  imports: [
    RouterLink,
    DropdownComponent,
    PaginationComponent,
    PaypalPayoutAccountComponent,
  ],
  templateUrl: './payouts.page.html',
  styleUrl: './payouts.page.scss',
})
export class PayoutsPage {
  private readonly documentsService = inject(DocumentsService);
  private readonly i18n = inject(I18nService);
  private readonly payoutsService = inject(PayoutsService);

  readonly payouts = signal<PayoutItem[]>([]);
  readonly onboarding = signal<PayoutOnboardingStatus | null>(null);
  readonly onboardingLoading = signal(true);
  readonly onboardingStarting = signal(false);
  readonly onboardingError = signal(false);
  readonly documents = signal<DocumentItem[]>([]);
  readonly isLoading = signal(true);
  readonly hasDownloadError = signal(false);
  readonly downloadingId = signal<number | null>(null);
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
    this.loadOnboarding();
    this.loadPayouts();
    this.loadDocuments();
  }

  startOnboarding(): void {
    if (this.onboardingStarting()) return;
    this.onboardingStarting.set(true);
    this.onboardingError.set(false);
    this.stripeLinkRequest().subscribe({
      next: ({ url }) => this.openOnboarding(url),
      error: () => this.failOnboarding(),
    });
  }

  onboardingTitle(): string {
    if (this.onboarding()?.ready) return this.text('payoutsOnboardingReadyTitle');
    if (this.onboarding()?.connected) return this.text('payoutsOnboardingPendingTitle');
    return this.text('payoutsOnboardingRequiredTitle');
  }

  onboardingDescription(): string {
    if (this.onboarding()?.ready) return this.text('payoutsOnboardingReadyDescription');
    if (this.onboarding()?.connected) return this.text('payoutsOnboardingPendingDescription');
    return this.text('payoutsOnboardingRequiredDescription');
  }

  onboardingAction(): string {
    if (this.onboardingStarting()) return this.text('payoutsOnboardingStarting');
    if (this.onboarding()?.ready) return this.text('payoutsOnboardingManage');
    if (this.onboarding()?.connected) return this.text('payoutsOnboardingContinue');
    return this.text('payoutsOnboardingStart');
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

  statementFor(payout: PayoutItem): DocumentItem | undefined {
    return this.documents().find(
      (item) => item.order_id === payout.order_id && item.document_type === 'payout_statement',
    );
  }

  downloadStatement(payout: PayoutItem): void {
    const statement = this.statementFor(payout);
    if (!statement || this.downloadingId()) return;
    this.downloadingId.set(payout.id);
    this.hasDownloadError.set(false);
    this.documentsService.download(statement).subscribe({
      next: () => this.downloadingId.set(null),
      error: () => this.failDownload(),
    });
  }

  payoutAmount(payout: PayoutItem): string {
    return formatMoney(payout.amount, payout.currency, this.i18n.current());
  }

  createdDate(payout: PayoutItem): string {
    return formatDisplayDate(payout.created_at, this.i18n.current());
  }

  statusDate(payout: PayoutItem): string {
    const value = payout.paid_at || payout.processing_at || payout.eligible_at;
    return value ? formatDisplayDate(value, this.i18n.current()) : '';
  }

  statusDateLabel(payout: PayoutItem): string {
    if (payout.paid_at) return this.text('payoutsColumnPaid');
    if (payout.processing_at) return this.text('payoutsColumnProcessing');
    return this.text('payoutsColumnEligible');
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

  private stripeLinkRequest() {
    if (this.onboarding()?.ready) return this.payoutsService.createStripeDashboardLink();
    return this.payoutsService.createOnboardingLink();
  }

  private loadPayouts(): void {
    this.isLoading.set(true);
    this.payoutsService.list().subscribe({
      next: (payouts) => this.completeLoad(payouts),
      error: () => this.completeLoad([]),
    });
  }

  private loadOnboarding(): void {
    this.payoutsService.onboardingStatus().subscribe({
      next: (status) => this.completeOnboardingLoad(status),
      error: () => this.failOnboardingLoad(),
    });
  }

  private completeOnboardingLoad(status: PayoutOnboardingStatus): void {
    this.onboarding.set(status);
    this.onboardingLoading.set(false);
  }

  private failOnboardingLoad(): void {
    this.onboardingLoading.set(false);
    this.onboardingError.set(true);
  }

  private openOnboarding(url: string): void {
    window.location.assign(url);
  }

  private failOnboarding(): void {
    this.onboardingStarting.set(false);
    this.onboardingError.set(true);
  }

  private loadDocuments(): void {
    this.documentsService.list().subscribe({
      next: (documents) => this.documents.set(documents),
      error: () => this.documents.set([]),
    });
  }

  private completeLoad(payouts: PayoutItem[]): void {
    this.payouts.set(payouts);
    this.isLoading.set(false);
  }

  private failDownload(): void {
    this.downloadingId.set(null);
    this.hasDownloadError.set(true);
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
    return [payout.id, payout.order_id, payout.status, payout.external_reference]
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
