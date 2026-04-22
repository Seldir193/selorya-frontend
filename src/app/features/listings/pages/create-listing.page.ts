import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CategoriesService } from '../../../core/services/categories.service';
import { ListingsService } from '../../../core/services/listings.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-create-listing-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './create-listing.page.html',
  styleUrls: ['./create-listing.page.scss'],
})
export class CreateListingPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly categoriesService = inject(CategoriesService);
  private readonly listingsService = inject(ListingsService);

  readonly categories = signal<Category[]>([]);
  readonly errorText = signal('');
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

    this.listingsService
      .create(this.form.getRawValue())
      .pipe(
        switchMap((listing) => {
          const files = this.selectedFiles();
          if (!files.length) {
            return of(listing);
          }

          const uploads = files.map((file, index) =>
            this.listingsService.uploadImage(listing.slug, file, listing.title, index, index === 0),
          );

          return forkJoin(uploads).pipe(switchMap(() => of(listing)));
        }),
      )
      .subscribe({
        next: (listing) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/listings', listing.slug]);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.errorText.set('Listing could not be created.');
        },
      });
  }
}
