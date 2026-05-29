import { Component, computed, inject, signal } from '@angular/core';
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

@Component({
  selector: 'app-create-listing-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormSelectComponent],
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],
})
export class CreateListingPage {
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

  readonly categoryOptions = computed<SelectOption[]>(() => {
    return this.categories().map((category) => ({
      value: category.id,
      label: category.name,
    }));
  });

  // readonly conditionOptions = computed<SelectOption[]>(() => [
  //   { value: 'new', label: this.text('listingConditionNew') },
  //   { value: 'like_new', label: this.text('listingConditionLikeNew') },
  //   { value: 'very_good', label: this.text('listingConditionVeryGood') },
  //   { value: 'good', label: this.text('listingConditionGood') },
  //   { value: 'acceptable', label: this.text('listingConditionAcceptable') },
  // ]);

  // readonly statusOptions = computed<SelectOption[]>(() => [
  //   { value: 'draft', label: this.text('listingStatusDraft') },
  //   { value: 'published', label: this.text('listingStatusPublished') },
  //   { value: 'sold', label: this.text('listingStatusSold') },
  //   { value: 'archived', label: this.text('listingStatusArchived') },
  // ]);
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
      next: (categories) => {
        this.categories.set(categories);
      },
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.selectedFiles.set(files);
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

  text(key: string): string {
    return this.i18n.t(key);
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
}

// import { Component, inject, signal } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { forkJoin, of, switchMap } from 'rxjs';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { CategoriesService } from '../../../core/services/categories.service';
// import { ListingsService } from '../../../core/services/listings.service';
// import { Category } from '../../../core/models/category.model';
// import { ToastService } from '../../../core/services/toast.service';
// import { I18nService } from '../../../core/services/i18n.service';

// @Component({
//   selector: 'app-create-listing-page',
//   standalone: true,
//   imports: [
//     ReactiveFormsModule,
//     MatButtonModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//   ],
//   templateUrl: './create-listing.page.html',
//   styleUrls: ['./create-listing.page.scss'],
// })
// export class CreateListingPage {
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
//       next: (categories) => {
//         this.categories.set(categories);
//       },
//     });
//   }

//   onFilesSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     const files = Array.from(input.files ?? []);
//     this.selectedFiles.set(files);
//   }

//   submit(): void {
//     if (this.form.invalid || this.isSubmitting()) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     this.errorText.set('');
//     this.isSubmitting.set(true);

//     this.listingsService
//       .create(this.form.getRawValue())
//       .pipe(
//         switchMap((listing) => {
//           const files = this.selectedFiles();
//           if (!files.length) {
//             return of(listing);
//           }

//           const uploads = files.map((file, index) =>
//             this.listingsService.uploadImage(listing.slug, file, listing.title, index, index === 0),
//           );

//           return forkJoin(uploads).pipe(switchMap(() => of(listing)));
//         }),
//       )
//       .subscribe({
//         next: (listing) => {
//           this.isSubmitting.set(false);
//           this.router.navigate(['/listings', listing.slug]);
//           this.toast.success(this.i18n.t('listingCreated'));
//         },
//         error: () => {
//           this.isSubmitting.set(false);
//           this.errorText.set('Listing could not be created.');

//           const message = this.i18n.t('listingCreateFailed');
//           this.errorText.set(message);
//           this.toast.error(message);
//         },
//       });
//   }
// }
