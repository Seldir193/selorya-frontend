import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ListingsService } from '../../../core/services/listings.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { ToastService } from '../../../core/services/toast.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Category } from '../../../core/models/category.model';
import { Listing } from '../../../core/models/listing.model';

@Component({
  selector: 'app-edit-listing-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './edit-listing.page.html',
  styleUrls: ['./edit-listing.page.scss'],
})
export class EditListingPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly listingsService = inject(ListingsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';
  readonly categories = signal<Category[]>([]);
  readonly listing = signal<Listing | null>(null);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly selectedFiles = signal<File[]>([]);

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

    this.reloadListing();
  }

  reloadListing(): void {
    this.listingsService.detail(this.slug).subscribe({
      next: (listing) => {
        this.listing.set(listing);
        this.form.patchValue({
          category: listing.category,
          title: listing.title,
          slug: listing.slug,
          description: listing.description,
          price: listing.price,
          condition: listing.condition,
          status: listing.status,
          city: listing.city,
          country: listing.country,
          is_featured: listing.is_featured,
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles.set(Array.from(input.files ?? []));
  }

  uploadImages(): void {
    const listing = this.listing();
    const files = this.selectedFiles();

    if (!listing || !files.length) {
      return;
    }

    files.forEach((file, index) => {
      this.listingsService.uploadImage(listing.slug, file, listing.title, index, false).subscribe({
        next: () => {
          this.toast.success('Image uploaded successfully.');
          this.reloadListing();
        },
      });
    });
  }

  makePrimary(imageId: number, altText: string, sortOrder: number): void {
    this.listingsService
      .updateImage(imageId, {
        alt_text: altText,
        sort_order: sortOrder,
        is_primary: true,
      })
      .subscribe({
        next: () => {
          this.toast.success('Primary image updated.');
          this.reloadListing();
        },
      });
  }

  deleteImage(imageId: number): void {
    this.listingsService.deleteImage(imageId).subscribe({
      next: () => {
        this.toast.success('Image deleted successfully.');
        this.reloadListing();
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.listingsService.update(this.slug, this.form.getRawValue()).subscribe({
      next: (listing) => {
        this.isSubmitting.set(false);
        this.toast.success(this.i18n.t('listingUpdated'));
        this.router.navigate(['/listings', listing.slug]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.error(this.i18n.t('listingUpdateFailed'));
      },
    });
  }

  deleteListing(): void {
    this.listingsService.delete(this.slug).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('listingDeleted'));
        this.router.navigateByUrl('/my-listings');
      },
      error: () => {
        this.toast.error(this.i18n.t('listingDeleteFailed'));
      },
    });
  }
}
