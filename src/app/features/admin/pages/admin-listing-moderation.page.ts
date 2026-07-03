import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Listing } from '../../../core/models/listing.model';
import { ListingModerationParams, ListingsService } from '../../../core/services/listings.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatDisplayDate } from '../../../core/utils/format.utils';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

type ListingDecisionAction = 'approve' | 'reject';

const CONDITION_LABEL_KEYS: Record<string, string> = {
  new: 'listingConditionNew',
  like_new: 'listingConditionLikeNew',
  very_good: 'listingConditionVeryGood',
  good: 'listingConditionGood',
  acceptable: 'listingConditionAcceptable',
};

const ACTION_TITLE_KEYS: Record<ListingDecisionAction, string> = {
  approve: 'adminListingModerationApproveTitle',
  reject: 'adminListingModerationRejectTitle',
};

const ACTION_DESCRIPTION_KEYS: Record<ListingDecisionAction, string> = {
  approve: 'adminListingModerationApproveDescription',
  reject: 'adminListingModerationRejectDescription',
};

const ACTION_CONFIRM_KEYS: Record<ListingDecisionAction, string> = {
  approve: 'adminListingModerationApproveConfirm',
  reject: 'adminListingModerationRejectConfirm',
};

const ACTION_SUCCESS_KEYS: Record<ListingDecisionAction, string> = {
  approve: 'adminListingModerationApproveSuccess',
  reject: 'adminListingModerationRejectSuccess',
};

@Component({
  selector: 'app-admin-listing-moderation-page',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, DialogComponent],
  templateUrl: './admin-listing-moderation.page.html',
  styleUrls: ['./admin-listing-moderation.page.scss'],
})
export class AdminListingModerationPage {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly listingsService = inject(ListingsService);
  private readonly toast = inject(ToastService);

  readonly listings = signal<Listing[]>([]);
  readonly searchQuery = signal('');
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly selectedListing = signal<Listing | null>(null);
  readonly selectedAction = signal<ListingDecisionAction | null>(null);
  readonly isActionSubmitting = signal(false);

  readonly decisionForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.maxLength(255)]],
  });

  readonly isDecisionDialogOpen = computed(() => {
    return Boolean(this.selectedListing() && this.selectedAction());
  });

  constructor() {
    this.loadListings();
  }

  loadListings(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.listingsService.listForModeration(this.listParams()).subscribe({
      next: (listings) => this.handleListingsLoaded(listings),
      error: () => this.handleListingsLoadFailed(),
    });
  }

  submitSearch(event: Event): void {
    event.preventDefault();
    this.loadListings();
  }

  updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  imageUrl(listing: Listing): string {
    const primaryImage = listing.images.find((image) => image.is_primary);
    return primaryImage?.image_url || listing.images[0]?.image_url || '';
  }

  conditionLabel(condition: string): string {
    const key = CONDITION_LABEL_KEYS[condition];
    return key ? this.text(key) : condition;
  }

  sellerTypeLabel(listing: Listing): string {
    return listing.seller_type === 'commercial'
      ? this.text('adminListingModerationCommercialSeller')
      : this.text('adminListingModerationPrivateSeller');
  }

  submittedDate(listing: Listing): string {
    return listing.submitted_at
      ? formatDisplayDate(listing.submitted_at, this.i18n.current())
      : this.text('adminListingModerationLocationMissing');
  }

  locationLabel(listing: Listing): string {
    const location = [listing.city, listing.country].filter(Boolean).join(', ');

    return location || this.text('adminListingModerationLocationMissing');
  }

  openDecisionDialog(listing: Listing, action: ListingDecisionAction): void {
    if (listing.status !== 'pending_review') {
      return;
    }

    this.selectedListing.set(listing);
    this.selectedAction.set(action);
    this.decisionForm.reset({ reason: '' });
  }

  closeDecisionDialog(): void {
    if (this.isActionSubmitting()) {
      return;
    }

    this.selectedListing.set(null);
    this.selectedAction.set(null);
    this.decisionForm.reset({ reason: '' });
  }

  requiresDecisionReason(): boolean {
    return this.selectedAction() === 'reject';
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
    const listing = this.selectedListing();
    const action = this.selectedAction();

    if (!listing || !action || this.isActionSubmitting()) {
      return;
    }

    if (this.requiresDecisionReason() && this.decisionForm.invalid) {
      this.decisionForm.markAllAsTouched();
      return;
    }

    this.isActionSubmitting.set(true);
    this.decisionRequest(listing, action).subscribe({
      next: () => this.handleDecisionSuccess(action),
      error: () => this.handleDecisionFailed(),
    });
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private listParams(): ListingModerationParams {
    return {
      status: 'pending_review',
      search: this.searchQuery(),
    };
  }

  private handleListingsLoaded(listings: Listing[]): void {
    this.listings.set(listings);
    this.isLoading.set(false);
  }

  private handleListingsLoadFailed(): void {
    this.listings.set([]);
    this.hasError.set(true);
    this.isLoading.set(false);
  }

  private decisionRequest(listing: Listing, action: ListingDecisionAction): Observable<Listing> {
    if (action === 'approve') {
      return this.listingsService.approveModeration(listing.slug);
    }

    return this.listingsService.rejectModeration(
      listing.slug,
      this.decisionForm.controls.reason.value,
    );
  }

  private handleDecisionSuccess(action: ListingDecisionAction): void {
    this.isActionSubmitting.set(false);
    this.closeDecisionDialog();
    this.toast.success(this.text(ACTION_SUCCESS_KEYS[action]));
    this.loadListings();
  }

  private handleDecisionFailed(): void {
    this.isActionSubmitting.set(false);
    this.toast.error(this.text('adminListingModerationActionFailed'));
  }
}
