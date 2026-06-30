import { Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ListingsService } from '../../../core/services/listings.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';
import {
  Listing,
  ListingCreatePayload,
  ListingSubmissionStatus,
} from '../../../core/models/listing.model';
import {
  FormSelectComponent,
  SelectOption,
} from '../../../shared/components/form-select/form-select.component';

const MAX_LISTING_IMAGES = 12;

interface SelectedImagePreview {
  file: File;
  url: string;
}

@Component({
  selector: 'app-create-listing-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormSelectComponent],
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],
})
export class CreateListingPage implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly listingsService = inject(ListingsService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly categories = signal<Category[]>([]);
  readonly errorText = signal('');
  readonly isSubmitting = signal(false);
  readonly selectedFiles = signal<File[]>([]);
  readonly selectedImagePreviews = signal<SelectedImagePreview[]>([]);
  readonly selectedPreviewIndex = signal<number | null>(null);
  readonly isSelectedPreviewPortrait = signal(false);
  readonly maxListingImages = MAX_LISTING_IMAGES;

  readonly remainingImageSlots = computed(() => {
    return Math.max(MAX_LISTING_IMAGES - this.selectedFiles().length, 0);
  });

  readonly canSelectMoreImages = computed(() => this.remainingImageSlots() > 0);

  readonly activeSelectedPreview = computed(() => {
    const index = this.selectedPreviewIndex();
    return index === null ? null : (this.selectedImagePreviews()[index] ?? null);
  });

  readonly isSelectedPreviewOpen = computed(() => this.activeSelectedPreview() !== null);
  readonly selectedPreviewTotal = computed(() => this.selectedImagePreviews().length);

  readonly currentSelectedPreviewPosition = computed(() => {
    const index = this.selectedPreviewIndex();
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
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.revokePreviewUrls(this.selectedImagePreviews());
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
    const draftOption = { value: 'draft', label: this.text('listingStatusDraft') };

    if (this.isCommercialReviewRestricted()) {
      return [draftOption];
    }

    return [draftOption, this.pendingReviewOption()];
  }

  isCommercialReviewRestricted(): boolean {
    const profile = this.authService.user()?.seller_profile;
    return profile?.seller_type === 'commercial' && profile.commercial_status !== 'approved';
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = this.getAllowedFiles(Array.from(input.files ?? []));
    this.appendSelectedFiles(files);
    input.value = '';
  }

  removeSelectedImage(index: number): void {
    const preview = this.selectedImagePreviews()[index];

    if (!preview) {
      return;
    }

    this.syncPreviewIndexAfterRemoval(index);
    this.removePreviewAtIndex(index, preview);
  }

  openSelectedPreview(index: number): void {
    if (!this.selectedImagePreviews()[index]) {
      return;
    }

    this.isSelectedPreviewPortrait.set(false);
    this.selectedPreviewIndex.set(index);
  }

  closeSelectedPreview(): void {
    this.selectedPreviewIndex.set(null);
    this.isSelectedPreviewPortrait.set(false);
  }

  showPreviousSelectedPreview(): void {
    this.showSelectedPreviewAtOffset(-1);
  }

  showNextSelectedPreview(): void {
    this.showSelectedPreviewAtOffset(1);
  }

  updateSelectedPreviewImageShape(event: Event): void {
    const image = event.target as HTMLImageElement;
    this.isSelectedPreviewPortrait.set(image.naturalHeight > image.naturalWidth * 1.35);
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorText.set('');
    this.isSubmitting.set(true);
    this.createListing();
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  private loadCategories(): void {
    this.categoriesService.list().subscribe({
      next: (categories) => this.categories.set(categories),
    });
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

  private appendSelectedFiles(files: File[]): void {
    if (!files.length) {
      return;
    }

    this.selectedFiles.update((currentFiles) => [...currentFiles, ...files]);
    this.appendImagePreviews(files);
  }

  private appendImagePreviews(files: File[]): void {
    const previews = files.map((file) => this.createImagePreview(file));
    this.selectedImagePreviews.update((currentPreviews) => [...currentPreviews, ...previews]);
  }

  private createImagePreview(file: File): SelectedImagePreview {
    return { file, url: URL.createObjectURL(file) };
  }

  private removePreviewAtIndex(index: number, preview: SelectedImagePreview): void {
    URL.revokeObjectURL(preview.url);
    this.selectedFiles.update((files) => files.filter((_, fileIndex) => fileIndex !== index));
    this.selectedImagePreviews.update((previews) => {
      return previews.filter((_, previewIndex) => previewIndex !== index);
    });
  }

  private syncPreviewIndexAfterRemoval(index: number): void {
    const currentIndex = this.selectedPreviewIndex();

    if (currentIndex === null) {
      return;
    }

    this.updatePreviewIndexAfterRemoval(index, currentIndex);
  }

  private updatePreviewIndexAfterRemoval(index: number, currentIndex: number): void {
    const nextTotal = this.selectedPreviewTotal() - 1;

    if (!nextTotal) {
      this.closeSelectedPreview();
      return;
    }

    this.setNextPreviewIndex(index, currentIndex, nextTotal);
  }

  private setNextPreviewIndex(index: number, currentIndex: number, total: number): void {
    const nextIndex = index < currentIndex ? currentIndex - 1 : currentIndex;
    this.selectedPreviewIndex.set(Math.min(nextIndex, total - 1));
  }

  private revokePreviewUrls(previews: SelectedImagePreview[]): void {
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }

  private showSelectedPreviewAtOffset(offset: number): void {
    const index = this.selectedPreviewIndex();
    const total = this.selectedPreviewTotal();

    if (index === null || !total) {
      return;
    }

    this.isSelectedPreviewPortrait.set(false);
    this.selectedPreviewIndex.set((index + offset + total) % total);
  }

  private createListing(): void {
    this.listingsService
      .create(this.createPayload())
      .pipe(switchMap((listing) => this.uploadListingImages(listing)))
      .subscribe({
        next: (listing) => this.handleCreatedListing(listing),
        error: () => this.handleCreateError(),
      });
  }

  private createPayload(): ListingCreatePayload {
    return {
      ...this.form.getRawValue(),
      status: this.requestedStatus(),
    };
  }

  private requestedStatus(): ListingSubmissionStatus {
    return this.isCommercialReviewRestricted() ? 'draft' : this.form.controls.status.value;
  }

  private uploadListingImages(listing: Listing) {
    const files = this.selectedFiles();
    return files.length ? this.uploadSelectedImages(listing, files) : of(listing);
  }

  private uploadSelectedImages(listing: Listing, files: File[]) {
    const uploads = files.map((file, index) => {
      return this.listingsService.uploadImage(
        listing.slug,
        file,
        listing.title,
        index,
        index === 0,
      );
    });

    return forkJoin(uploads).pipe(switchMap(() => of(listing)));
  }

  private handleCreatedListing(listing: Listing): void {
    this.isSubmitting.set(false);
    this.navigateAfterListingMutation(listing);
    this.toast.success(this.i18n.t('listingCreated'));
  }

  private navigateAfterListingMutation(listing: Listing): void {
    const route = listing.status === 'published' ? ['/listings', listing.slug] : ['/my-listings'];
    this.router.navigate(route);
  }

  private handleCreateError(): void {
    this.isSubmitting.set(false);
    const message = this.i18n.t('listingCreateFailed');
    this.errorText.set(message);
    this.toast.error(message);
  }

  @HostListener('document:keydown.escape')
  closeSelectedPreviewOnEscape(): void {
    if (this.isSelectedPreviewOpen()) {
      this.closeSelectedPreview();
    }
  }

  @HostListener('document:keydown.arrowleft')
  showPreviousSelectedPreviewOnArrowLeft(): void {
    if (this.isSelectedPreviewOpen()) {
      this.showPreviousSelectedPreview();
    }
  }

  @HostListener('document:keydown.arrowright')
  showNextSelectedPreviewOnArrowRight(): void {
    if (this.isSelectedPreviewOpen()) {
      this.showNextSelectedPreview();
    }
  }
}
