import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ListingsService } from '../../../core/services/listings.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { ToastService } from '../../../core/services/toast.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Category } from '../../../core/models/category.model';
import {
  Listing,
  ListingStatus,
  ListingSubmissionStatus,
  ListingUpdatePayload,
} from '../../../core/models/listing.model';
import {
  FormSelectComponent,
  SelectOption,
} from '../../../shared/components/form-select/form-select.component';

const MAX_LISTING_IMAGES = 12;

const STATUS_TEXT_KEYS: Record<ListingStatus, string> = {
  draft: 'listingStatusDraft',

  pending_review: 'listingStatusPendingReviewLabel',
  published: 'listingStatusPublished',
  blocked: 'listingStatusBlocked',
  rejected: 'listingStatusRejected',
  sold: 'listingStatusSold',
  archived: 'listingStatusArchived',
};

@Component({
  selector: 'app-edit-listing-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormSelectComponent],
  templateUrl: './edit-listing.page.html',
  styleUrls: ['./edit-listing.page.scss'],
})
export class EditListingPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly listingsService = inject(ListingsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';
  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly listing = signal<Listing | null>(null);
  readonly selectedFiles = signal<File[]>([]);
  readonly maxListingImages = MAX_LISTING_IMAGES;
  readonly previewImageIndex = signal<number | null>(null);

  readonly listingImages = computed(() => this.listing()?.images ?? []);
  readonly imageCount = computed(() => this.listingImages().length);
  readonly isImageLimitExceeded = computed(() => this.imageCount() > MAX_LISTING_IMAGES);

  readonly remainingImageSlots = computed(() => {
    return Math.max(MAX_LISTING_IMAGES - this.imageCount(), 0);
  });

  readonly canSelectMoreImages = computed(() => this.remainingImageSlots() > 0);

  readonly canUploadSelectedImages = computed(() => {
    const selectedCount = this.selectedFiles().length;
    return selectedCount > 0 && selectedCount <= this.remainingImageSlots();
  });

  readonly primaryImage = computed(() => {
    const images = this.listingImages();
    return images.find((image) => image.is_primary) ?? images[0] ?? null;
  });

  readonly secondaryImages = computed(() => {
    const primaryImage = this.primaryImage();
    return this.listingImages().filter((image) => image.id !== primaryImage?.id);
  });

  readonly activePreviewImage = computed(() => {
    const index = this.previewImageIndex();
    return index === null ? null : (this.listingImages()[index] ?? null);
  });

  readonly isImagePreviewOpen = computed(() => this.activePreviewImage() !== null);
  readonly imagePreviewTotal = computed(() => this.listingImages().length);

  readonly currentPreviewPosition = computed(() => {
    const index = this.previewImageIndex();
    return index === null ? 0 : index + 1;
  });

  readonly categoryOptions = computed<SelectOption[]>(() => {
    return this.categories().map((category) => ({
      value: category.id,
      label: category.name,
    }));
  });

  readonly form = this.fb.nonNullable.group({
    category: [0, [Validators.required]],
    title: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: ['', [Validators.required]],
    condition: ['very_good', [Validators.required]],
    status: this.fb.nonNullable.control<ListingSubmissionStatus>('draft', {
      validators: [Validators.required],
    }),
    city: ['', [Validators.required]],
    country: ['Germany', [Validators.required]],
    is_featured: [false, [Validators.required]],
  });

  constructor() {
    this.initializeCachedCategories();
    this.initializeCachedListing();
    this.loadInitialData();
  }

  conditionOptions(): SelectOption[] {
    return [
      { value: 'new', label: this.text('listingConditionNew') },
      { value: 'like_new', label: this.text('listingConditionLikeNew') },
      { value: 'very_good', label: this.text('listingConditionVeryGood') },
      { value: 'good', label: this.text('listingConditionGood') },
      { value: 'acceptable', label: this.text('listingConditionAcceptable') },
    ];
  }

  statusOptions(): SelectOption[] {
    if (this.isCommercialReviewRestricted()) {
      return [this.draftOption()];
    }

    return [this.draftOption(), this.pendingReviewOption()];
  }

  isCommercialReviewRestricted(): boolean {
    const profile = this.authService.user()?.seller_profile;

    return profile?.seller_type === 'commercial' && profile.commercial_status !== 'approved';
  }

  currentStatusLabel(): string {
    const status = this.listing()?.status;

    return status ? this.listingStatusLabel(status) : '';
  }

  listingStatusLabel(status: ListingStatus): string {
    return this.text(STATUS_TEXT_KEYS[status]);
  }

  moderationReason(): string {
    return this.listing()?.moderation_reason ?? '';
  }

  showModerationReason(): boolean {
    const status = this.listing()?.status;

    return Boolean(this.moderationReason() && (status === 'blocked' || status === 'rejected'));
  }

  reloadListing(): void {
    this.listingsService.manageDetail(this.slug).subscribe({
      next: (listing) => this.handleReloadedListing(listing),
      error: () => this.isLoading.set(false),
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    this.selectedFiles.set(this.getAllowedFiles(files));
    input.value = '';
  }

  uploadImages(): void {
    const listing = this.listing();
    const files = this.selectedFiles();

    if (!listing || !this.canUploadSelectedImages()) {
      return;
    }

    this.uploadSelectedImages(listing, files);
  }

  makePrimary(imageId: number, altText: string, sortOrder: number): void {
    this.listingsService
      .updateImage(imageId, this.getPrimaryImagePayload(altText, sortOrder))
      .subscribe({
        next: () => this.handlePrimaryImageUpdated(),
      });
  }

  deleteImage(imageId: number): void {
    this.listingsService.deleteImage(imageId).subscribe({
      next: () => this.handleImageDeleted(),
    });
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.updateListing();
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  deleteListing(): void {
    this.listingsService.delete(this.slug).subscribe({
      next: () => this.handleListingDeleted(),
      error: () => this.toast.error(this.i18n.t('listingDeleteFailed')),
    });
  }

  openImagePreview(imageId: number): void {
    const index = this.getPreviewImageIndex(imageId);

    if (index >= 0) {
      this.previewImageIndex.set(index);
    }
  }

  closeImagePreview(): void {
    this.previewImageIndex.set(null);
  }

  showPreviousImage(): void {
    this.showImageAtOffset(-1);
  }

  showNextImage(): void {
    this.showImageAtOffset(1);
  }

  selectPreviewImage(index: number): void {
    if (this.listingImages()[index]) {
      this.previewImageIndex.set(index);
    }
  }

  private initializeCachedCategories(): void {
    const categories = this.categoriesService.getCachedCategories();

    if (categories.length) {
      this.categories.set(categories);
    }
  }

  private initializeCachedListing(): void {
    const listing = this.listingsService.getCachedListing(this.slug);

    if (!listing) {
      return;
    }

    this.listing.set(listing);
    this.patchListingForm(listing);
    this.isLoading.set(false);
  }

  private loadInitialData(): void {
    forkJoin({
      categories: this.categoriesService.list(),
      listing: this.listingsService.manageDetail(this.slug),
    }).subscribe({
      next: (data) => this.handleInitialData(data.categories, data.listing),
      error: () => this.isLoading.set(false),
    });
  }

  private handleInitialData(categories: Category[], listing: Listing): void {
    this.categories.set(categories);
    this.handleReloadedListing(listing);
    this.isLoading.set(false);
  }

  private handleReloadedListing(listing: Listing): void {
    this.listing.set(listing);
    this.patchListingForm(listing);
  }

  private patchListingForm(listing: Listing): void {
    this.form.patchValue({
      category: listing.category,
      title: listing.title,
      slug: listing.slug,
      description: listing.description,
      price: listing.price,
      condition: listing.condition,
      status: this.submissionStatus(listing.status),
      city: listing.city,
      country: listing.country,
      is_featured: listing.is_featured,
    });
  }

  private submissionStatus(status: ListingStatus): ListingSubmissionStatus {
    if (this.isCommercialReviewRestricted()) {
      return 'draft';
    }

    return status === 'draft' ? 'draft' : 'pending_review';
  }

  private draftOption(): SelectOption {
    return {
      value: 'draft',
      label: this.text('listingStatusDraft'),
    };
  }

  private pendingReviewOption(): SelectOption {
    return {
      value: 'pending_review',
      label: this.text('listingStatusPendingReview'),
    };
  }

  private getAllowedFiles(files: File[]): File[] {
    const remainingSlots = this.remainingImageSlots();

    if (files.length <= remainingSlots) {
      return files;
    }

    this.toast.error(this.text('listingImageLimitReached'));
    return files.slice(0, remainingSlots);
  }

  private uploadSelectedImages(listing: Listing, files: File[]): void {
    files.forEach((file, index) => {
      this.uploadSingleImage(listing, file, index);
    });
  }

  private uploadSingleImage(listing: Listing, file: File, index: number): void {
    const sortOrder = this.imageCount() + index;
    const isPrimary = this.imageCount() === 0 && index === 0;

    this.listingsService
      .uploadImage(listing.slug, file, listing.title, sortOrder, isPrimary)
      .subscribe({
        next: () => this.handleImageUploaded(),
      });
  }

  private getPrimaryImagePayload(altText: string, sortOrder: number) {
    return {
      alt_text: altText,
      sort_order: sortOrder,
      is_primary: true,
    };
  }

  private getPreviewImageIndex(imageId: number): number {
    return this.listingImages().findIndex((image) => image.id === imageId);
  }

  private showImageAtOffset(offset: number): void {
    const index = this.previewImageIndex();
    const total = this.imagePreviewTotal();

    if (index === null || !total) {
      return;
    }

    this.previewImageIndex.set((index + offset + total) % total);
  }

  private handleImageUploaded(): void {
    this.toast.success('Image uploaded successfully.');
    this.reloadListing();
  }

  private handlePrimaryImageUpdated(): void {
    this.toast.success('Primary image updated.');
    this.reloadListing();
  }

  private handleImageDeleted(): void {
    this.toast.success('Image deleted successfully.');
    this.reloadListing();
  }

  private updateListing(): void {
    this.listingsService.update(this.slug, this.updatePayload()).subscribe({
      next: (listing) => this.handleListingUpdated(listing),
      error: () => this.handleListingUpdateFailed(),
    });
  }

  private updatePayload(): ListingUpdatePayload {
    return {
      ...this.form.getRawValue(),
      status: this.requestedStatus(),
    };
  }

  private requestedStatus(): ListingSubmissionStatus {
    return this.isCommercialReviewRestricted() ? 'draft' : this.form.controls.status.value;
  }

  private handleListingUpdated(listing: Listing): void {
    this.isSubmitting.set(false);
    this.toast.success(this.i18n.t('listingUpdated'));
    this.navigateAfterListingMutation(listing);
  }

  private navigateAfterListingMutation(listing: Listing): void {
    const route = listing.status === 'published' ? ['/listings', listing.slug] : ['/my-listings'];

    this.router.navigate(route);
  }

  private handleListingUpdateFailed(): void {
    this.isSubmitting.set(false);
    this.toast.error(this.i18n.t('listingUpdateFailed'));
  }

  private handleListingDeleted(): void {
    this.toast.success(this.i18n.t('listingDeleted'));
    this.router.navigateByUrl('/my-listings');
  }

  @HostListener('document:keydown.escape')
  closePreviewOnEscape(): void {
    if (this.isImagePreviewOpen()) {
      this.closeImagePreview();
    }
  }

  @HostListener('document:keydown.arrowleft')
  showPreviousOnArrowLeft(): void {
    if (this.isImagePreviewOpen()) {
      this.showPreviousImage();
    }
  }

  @HostListener('document:keydown.arrowright')
  showNextOnArrowRight(): void {
    if (this.isImagePreviewOpen()) {
      this.showNextImage();
    }
  }
}
