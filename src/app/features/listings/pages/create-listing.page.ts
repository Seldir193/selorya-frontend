import { Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { CategoriesService } from '../../../core/services/categories.service';
import { ListingsService } from '../../../core/services/listings.service';
import { Category } from '../../../core/models/category.model';
import { ToastService } from '../../../core/services/toast.service';
import { I18nService } from '../../../core/services/i18n.service';
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
  imports: [ReactiveFormsModule, FormSelectComponent],
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],
})
export class CreateListingPage implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
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
    status: ['draft', [Validators.required]],
    city: ['', [Validators.required]],
    country: ['Germany', [Validators.required]],
    is_featured: [false, [Validators.required]],
  });

  constructor() {
    this.categoriesService.list().subscribe({
      next: (categories) => this.categories.set(categories),
    });
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
    return [
      { value: 'draft', label: this.text('listingStatusDraft') },
      { value: 'published', label: this.text('listingStatusPublished') },
      { value: 'sold', label: this.text('listingStatusSold') },
      { value: 'archived', label: this.text('listingStatusArchived') },
    ];
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = this.getAllowedFiles(Array.from(input.files ?? []));

    this.appendSelectedFiles(files);
    input.value = '';
  }

  removeSelectedImage(index: number): void {
    const previews = this.selectedImagePreviews();
    const removedPreview = previews[index];

    if (!removedPreview) {
      return;
    }

    this.syncPreviewIndexAfterRemoval(index);
    this.removePreviewAtIndex(index, removedPreview);
  }

  openSelectedPreview(index: number): void {
    if (this.selectedImagePreviews()[index]) {
      this.selectedPreviewIndex.set(index);
    }
  }

  closeSelectedPreview(): void {
    this.selectedPreviewIndex.set(null);
  }

  showPreviousSelectedPreview(): void {
    this.showSelectedPreviewAtOffset(-1);
  }

  showNextSelectedPreview(): void {
    this.showSelectedPreviewAtOffset(1);
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
    return {
      file,
      url: URL.createObjectURL(file),
    };
  }

  private removePreviewAtIndex(index: number, preview: SelectedImagePreview): void {
    URL.revokeObjectURL(preview.url);
    this.selectedFiles.update((files) => files.filter((_, fileIndex) => fileIndex !== index));
    this.selectedImagePreviews.update((previews) =>
      previews.filter((_, itemIndex) => itemIndex !== index),
    );
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

  private setNextPreviewIndex(index: number, currentIndex: number, nextTotal: number): void {
    if (index < currentIndex) {
      this.selectedPreviewIndex.set(currentIndex - 1);
      return;
    }

    this.selectedPreviewIndex.set(Math.min(currentIndex, nextTotal - 1));
  }

  private revokePreviewUrls(previews: SelectedImagePreview[]): void {
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }

  private showSelectedPreviewAtOffset(offset: number): void {
    const currentIndex = this.selectedPreviewIndex();
    const totalImages = this.selectedPreviewTotal();

    if (currentIndex === null || !totalImages) {
      return;
    }

    this.selectedPreviewIndex.set((currentIndex + offset + totalImages) % totalImages);
  }

  private createListing(): void {
    this.listingsService
      .create(this.form.getRawValue())
      .pipe(switchMap((listing) => this.uploadListingImages(listing)))
      .subscribe({
        next: (listing) => this.handleCreatedListing(listing),
        error: () => this.handleCreateError(),
      });
  }

  private uploadListingImages(listing: { slug: string; title: string }) {
    const files = this.selectedFiles();

    if (!files.length) {
      return of(listing);
    }

    return this.uploadSelectedImages(listing, files);
  }

  private uploadSelectedImages(listing: { slug: string; title: string }, files: File[]) {
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

  private handleCreatedListing(listing: { slug: string }): void {
    this.isSubmitting.set(false);
    this.router.navigate(['/listings', listing.slug]);
    this.toast.success(this.i18n.t('listingCreated'));
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

// import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { forkJoin, of, switchMap } from 'rxjs';
// import { CategoriesService } from '../../../core/services/categories.service';
// import { ListingsService } from '../../../core/services/listings.service';
// import { Category } from '../../../core/models/category.model';
// import { ToastService } from '../../../core/services/toast.service';
// import { I18nService } from '../../../core/services/i18n.service';
// import {
//   FormSelectComponent,
//   SelectOption,
// } from '../../../shared/components/form-select/form-select.component';

// const MAX_LISTING_IMAGES = 12;

// interface SelectedImagePreview {
//   file: File;
//   url: string;
// }

// @Component({
//   selector: 'app-create-listing-page',
//   standalone: true,
//   imports: [ReactiveFormsModule, FormSelectComponent],
//   templateUrl: './create-listing.page.html',
//   styleUrls: ['./create-listing.page.scss'],
// })
// export class CreateListingPage implements OnDestroy {
//   private readonly fb = inject(FormBuilder);
//   private readonly router = inject(Router);
//   private readonly categoriesService = inject(CategoriesService);
//   private readonly listingsService = inject(ListingsService);
//   private readonly toast = inject(ToastService);
//   private readonly i18n = inject(I18nService);

//   readonly categories = signal<Category[]>([]);
//   readonly errorText = signal('');
//   readonly isSubmitting = signal(false);
//   readonly selectedFiles = signal<File[]>([]);
//   readonly selectedImagePreviews = signal<SelectedImagePreview[]>([]);
//   readonly maxListingImages = MAX_LISTING_IMAGES;

//   readonly remainingImageSlots = computed(() => {
//     return Math.max(MAX_LISTING_IMAGES - this.selectedFiles().length, 0);
//   });

//   readonly canSelectMoreImages = computed(() => this.remainingImageSlots() > 0);

//   readonly categoryOptions = computed<SelectOption[]>(() => {
//     return this.categories().map((category) => ({
//       value: category.id,
//       label: category.name,
//     }));
//   });

//   readonly form = this.fb.nonNullable.group({
//     category: [0, [Validators.required]],
//     title: ['', [Validators.required]],
//     slug: ['', [Validators.required]],
//     description: ['', [Validators.required]],
//     price: ['', [Validators.required]],
//     condition: ['very_good', [Validators.required]],
//     status: ['draft', [Validators.required]],
//     city: ['', [Validators.required]],
//     country: ['Germany', [Validators.required]],
//     is_featured: [false, [Validators.required]],
//   });

//   constructor() {
//     this.categoriesService.list().subscribe({
//       next: (categories) => this.categories.set(categories),
//     });
//   }

//   ngOnDestroy(): void {
//     this.revokePreviewUrls(this.selectedImagePreviews());
//   }

//   conditionOptions(): SelectOption[] {
//     return [
//       { value: 'new', label: this.text('listingConditionNew') },
//       { value: 'like_new', label: this.text('listingConditionLikeNew') },
//       { value: 'very_good', label: this.text('listingConditionVeryGood') },
//       { value: 'good', label: this.text('listingConditionGood') },
//       { value: 'acceptable', label: this.text('listingConditionAcceptable') },
//     ];
//   }

//   statusOptions(): SelectOption[] {
//     return [
//       { value: 'draft', label: this.text('listingStatusDraft') },
//       { value: 'published', label: this.text('listingStatusPublished') },
//       { value: 'sold', label: this.text('listingStatusSold') },
//       { value: 'archived', label: this.text('listingStatusArchived') },
//     ];
//   }

//   onFilesSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     const files = this.getAllowedFiles(Array.from(input.files ?? []));

//     this.appendSelectedFiles(files);
//     input.value = '';
//   }

//   removeSelectedImage(index: number): void {
//     const previews = this.selectedImagePreviews();
//     const removedPreview = previews[index];

//     if (!removedPreview) {
//       return;
//     }

//     this.removePreviewAtIndex(index, removedPreview);
//   }

//   submit(): void {
//     if (this.form.invalid || this.isSubmitting()) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     this.errorText.set('');
//     this.isSubmitting.set(true);
//     this.createListing();
//   }

//   text(key: string): string {
//     return this.i18n.t(key);
//   }

//   private getAllowedFiles(files: File[]): File[] {
//     const remainingSlots = this.remainingImageSlots();

//     if (files.length <= remainingSlots) {
//       return files;
//     }

//     this.toast.error(this.text('listingImageLimitReached'));
//     return files.slice(0, remainingSlots);
//   }

//   private appendSelectedFiles(files: File[]): void {
//     if (!files.length) {
//       return;
//     }

//     this.selectedFiles.update((currentFiles) => [...currentFiles, ...files]);
//     this.appendImagePreviews(files);
//   }

//   private appendImagePreviews(files: File[]): void {
//     const previews = files.map((file) => this.createImagePreview(file));
//     this.selectedImagePreviews.update((currentPreviews) => [...currentPreviews, ...previews]);
//   }

//   private createImagePreview(file: File): SelectedImagePreview {
//     return {
//       file,
//       url: URL.createObjectURL(file),
//     };
//   }

//   private removePreviewAtIndex(index: number, preview: SelectedImagePreview): void {
//     URL.revokeObjectURL(preview.url);
//     this.selectedFiles.update((files) => files.filter((_, fileIndex) => fileIndex !== index));
//     this.selectedImagePreviews.update((previews) =>
//       previews.filter((_, itemIndex) => itemIndex !== index),
//     );
//   }

//   private revokePreviewUrls(previews: SelectedImagePreview[]): void {
//     previews.forEach((preview) => URL.revokeObjectURL(preview.url));
//   }

//   private createListing(): void {
//     this.listingsService
//       .create(this.form.getRawValue())
//       .pipe(switchMap((listing) => this.uploadListingImages(listing)))
//       .subscribe({
//         next: (listing) => this.handleCreatedListing(listing),
//         error: () => this.handleCreateError(),
//       });
//   }

//   private uploadListingImages(listing: { slug: string; title: string }) {
//     const files = this.selectedFiles();

//     if (!files.length) {
//       return of(listing);
//     }

//     return this.uploadSelectedImages(listing, files);
//   }

//   private uploadSelectedImages(listing: { slug: string; title: string }, files: File[]) {
//     const uploads = files.map((file, index) => {
//       return this.listingsService.uploadImage(
//         listing.slug,
//         file,
//         listing.title,
//         index,
//         index === 0,
//       );
//     });

//     return forkJoin(uploads).pipe(switchMap(() => of(listing)));
//   }

//   private handleCreatedListing(listing: { slug: string }): void {
//     this.isSubmitting.set(false);
//     this.router.navigate(['/listings', listing.slug]);
//     this.toast.success(this.i18n.t('listingCreated'));
//   }

//   private handleCreateError(): void {
//     this.isSubmitting.set(false);
//     const message = this.i18n.t('listingCreateFailed');
//     this.errorText.set(message);
//     this.toast.error(message);
//   }
// }
