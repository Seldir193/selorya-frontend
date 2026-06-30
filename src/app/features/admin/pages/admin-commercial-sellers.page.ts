import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CommercialSellerReview, CommercialStatus } from '../../../core/models/auth.model';
import { I18nService } from '../../../core/services/i18n.service';
import {
  CommercialSellerListParams,
  ProfilesService,
} from '../../../core/services/profiles.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatDisplayDate } from '../../../core/utils/format.utils';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import {
  DropdownComponent,
  DropdownOption,
} from '../../../shared/components/dropdown/dropdown.component';

type CommercialSellerFilter = 'all' | CommercialStatus;
type CommercialDecisionAction = 'approve' | 'reject' | 'suspend';

const STATUS_LABEL_KEYS: Record<CommercialStatus, string> = {
  not_requested: 'commercialStatusNotRequested',
  pending_review: 'commercialStatusPendingReview',
  approved: 'commercialStatusApproved',
  rejected: 'commercialStatusRejected',
  suspended: 'commercialStatusSuspended',
};

const ACTION_TITLE_KEYS: Record<CommercialDecisionAction, string> = {
  approve: 'adminCommercialApproveTitle',
  reject: 'adminCommercialRejectTitle',
  suspend: 'adminCommercialSuspendTitle',
};

const ACTION_DESCRIPTION_KEYS: Record<CommercialDecisionAction, string> = {
  approve: 'adminCommercialApproveDescription',
  reject: 'adminCommercialRejectDescription',
  suspend: 'adminCommercialSuspendDescription',
};

const ACTION_CONFIRM_KEYS: Record<CommercialDecisionAction, string> = {
  approve: 'adminCommercialApproveConfirm',
  reject: 'adminCommercialRejectConfirm',
  suspend: 'adminCommercialSuspendConfirm',
};

const ACTION_SUCCESS_KEYS: Record<CommercialDecisionAction, string> = {
  approve: 'adminCommercialApproveSuccess',
  reject: 'adminCommercialRejectSuccess',
  suspend: 'adminCommercialSuspendSuccess',
};

@Component({
  selector: 'app-admin-commercial-sellers-page',
  standalone: true,
  imports: [ReactiveFormsModule, DialogComponent, DropdownComponent],
  templateUrl: './admin-commercial-sellers.page.html',
  styleUrls: ['./admin-commercial-sellers.page.scss'],
})
export class AdminCommercialSellersPage {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly profilesService = inject(ProfilesService);
  private readonly toast = inject(ToastService);

  readonly sellers = signal<CommercialSellerReview[]>([]);
  readonly searchQuery = signal('');
  readonly activeStatus = signal<CommercialSellerFilter>('pending_review');
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly selectedSeller = signal<CommercialSellerReview | null>(null);
  readonly selectedAction = signal<CommercialDecisionAction | null>(null);
  readonly isActionSubmitting = signal(false);

  readonly decisionForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  readonly statusFilters: CommercialSellerFilter[] = [
    'all',
    'pending_review',
    'approved',
    'rejected',
    'suspended',
    'not_requested',
  ];

  readonly statusOptions = computed<DropdownOption<CommercialSellerFilter>[]>(() => {
    return this.statusFilters.map((status) => ({
      value: status,
      label: this.statusFilterLabel(status),
    }));
  });

  readonly isDecisionDialogOpen = computed(() => {
    return Boolean(this.selectedSeller() && this.selectedAction());
  });

  constructor() {
    this.loadSellers();
  }

  loadSellers(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.profilesService.listCommercialSellers(this.listParams()).subscribe({
      next: (sellers) => this.handleSellersLoaded(sellers),
      error: () => this.handleSellersLoadFailed(),
    });
  }

  submitSearch(event: Event): void {
    event.preventDefault();
    this.loadSellers();
  }

  updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  changeStatus(status: CommercialSellerFilter): void {
    if (status === this.activeStatus()) {
      return;
    }

    this.activeStatus.set(status);
    this.loadSellers();
  }

  commercialStatusLabel(status: CommercialStatus): string {
    return this.text(STATUS_LABEL_KEYS[status]);
  }

  sellerName(seller: CommercialSellerReview): string {
    return seller.commercial_legal_name || seller.user_full_name;
  }

  requestedDate(seller: CommercialSellerReview): string {
    return this.displayDate(seller.commercial_requested_at);
  }

  reviewedDate(seller: CommercialSellerReview): string {
    return this.displayDate(seller.commercial_reviewed_at);
  }

  reviewerEmail(seller: CommercialSellerReview): string {
    return this.valueOrFallback(seller.commercial_reviewer_email);
  }

  businessAddress(seller: CommercialSellerReview): string {
    const cityLine = [
      seller.commercial_postal_code,
      seller.commercial_city,
      seller.commercial_country,
    ]
      .filter(Boolean)
      .join(' ');

    return [seller.commercial_address_line_1, seller.commercial_address_line_2, cityLine]
      .filter(Boolean)
      .join(', ');
  }

  registryDetails(seller: CommercialSellerReview): string {
    return (
      [seller.commercial_register_court, seller.commercial_register_number]
        .filter(Boolean)
        .join(' · ') || this.text('adminCommercialNoValue')
    );
  }

  showRejectionReason(seller: CommercialSellerReview): boolean {
    return Boolean(seller.commercial_rejection_reason.trim());
  }

  isActionAvailable(seller: CommercialSellerReview, action: CommercialDecisionAction): boolean {
    if (action === 'suspend') {
      return seller.commercial_status !== 'suspended';
    }

    return seller.commercial_status === 'pending_review';
  }

  openDecisionDialog(seller: CommercialSellerReview, action: CommercialDecisionAction): void {
    if (!this.isActionAvailable(seller, action)) {
      return;
    }

    this.selectedSeller.set(seller);
    this.selectedAction.set(action);
    this.decisionForm.reset({ reason: '' });
  }

  closeDecisionDialog(): void {
    if (this.isActionSubmitting()) {
      return;
    }

    this.selectedSeller.set(null);
    this.selectedAction.set(null);
    this.decisionForm.reset({ reason: '' });
  }

  requiresDecisionReason(): boolean {
    const action = this.selectedAction();
    return action === 'reject' || action === 'suspend';
  }

  isDecisionReasonInvalid(): boolean {
    const control = this.decisionForm.controls.reason;
    return control.touched && control.invalid;
  }

  decisionTitle(): string {
    const action = this.selectedAction();
    return action ? this.text(ACTION_TITLE_KEYS[action]) : '';
  }

  decisionDescription(): string {
    const action = this.selectedAction();
    return action ? this.text(ACTION_DESCRIPTION_KEYS[action]) : '';
  }

  decisionConfirmLabel(): string {
    const action = this.selectedAction();
    return action ? this.text(ACTION_CONFIRM_KEYS[action]) : '';
  }

  canConfirmDecision(): boolean {
    return (
      !this.isActionSubmitting() && (!this.requiresDecisionReason() || this.decisionForm.valid)
    );
  }

  confirmDecision(): void {
    const seller = this.selectedSeller();
    const action = this.selectedAction();

    if (!seller || !action || this.isActionSubmitting()) {
      return;
    }

    if (this.requiresDecisionReason() && this.decisionForm.invalid) {
      this.decisionForm.markAllAsTouched();
      return;
    }

    this.isActionSubmitting.set(true);
    this.decisionRequest(seller, action).subscribe({
      next: () => this.handleDecisionSuccess(action),
      error: () => this.handleDecisionFailed(),
    });
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private listParams(): CommercialSellerListParams {
    const status = this.activeStatus();

    return {
      status: status === 'all' ? undefined : status,
      search: this.searchQuery(),
    };
  }

  private statusFilterLabel(status: CommercialSellerFilter): string {
    return status === 'all'
      ? this.text('adminCommercialAllStatuses')
      : this.commercialStatusLabel(status);
  }

  private handleSellersLoaded(sellers: CommercialSellerReview[]): void {
    this.sellers.set(sellers);
    this.isLoading.set(false);
  }

  private handleSellersLoadFailed(): void {
    this.sellers.set([]);
    this.hasError.set(true);
    this.isLoading.set(false);
  }

  private decisionRequest(
    seller: CommercialSellerReview,
    action: CommercialDecisionAction,
  ): Observable<CommercialSellerReview> {
    const reason = this.decisionForm.controls.reason.value.trim();

    if (action === 'approve') {
      return this.profilesService.approveCommercialSeller(seller.id);
    }

    return action === 'reject'
      ? this.profilesService.rejectCommercialSeller(seller.id, reason)
      : this.profilesService.suspendCommercialSeller(seller.id, reason);
  }

  private handleDecisionSuccess(action: CommercialDecisionAction): void {
    this.isActionSubmitting.set(false);
    this.closeDecisionDialog();
    this.toast.success(this.text(ACTION_SUCCESS_KEYS[action]));
    this.loadSellers();
  }

  private handleDecisionFailed(): void {
    this.isActionSubmitting.set(false);
    this.toast.error(this.text('adminCommercialActionFailed'));
  }

  private displayDate(value: string | null): string {
    return value
      ? formatDisplayDate(value, this.i18n.current())
      : this.text('adminCommercialNoValue');
  }

  private valueOrFallback(value: string | null): string {
    return value || this.text('adminCommercialNoValue');
  }
}
