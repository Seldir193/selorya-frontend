import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CategoriesService } from '../../../core/services/categories.service';
import { ListingsService } from '../../../core/services/listings.service';
import { Category } from '../../../core/models/category.model';
import { Listing } from '../../../core/models/listing.model';

@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './listings.page.html',
  styleUrl: './listings.page.scss',
})
export class ListingsPage {
  private readonly categoriesService = inject(CategoriesService);
  private readonly listingsService = inject(ListingsService);

  readonly categories = signal<Category[]>([]);
  readonly listings = signal<Listing[]>([]);
  readonly selectedCategory = signal('');
  readonly isLoading = signal(true);

  readonly filteredListings = computed(() => this.listings());

  constructor() {
    this.loadCategories();
    this.loadListings();
  }

  loadCategories(): void {
    this.categoriesService.list().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
    });
  }

  loadListings(category = ''): void {
    this.isLoading.set(true);

    this.listingsService.list(category ? { category } : undefined).subscribe({
      next: (listings) => {
        this.listings.set(listings);
        this.isLoading.set(false);
      },
      error: () => {
        this.listings.set([]);
        this.isLoading.set(false);
      },
    });
  }

  selectCategory(slug = ''): void {
    this.selectedCategory.set(slug);
    this.loadListings(slug);
  }

  primaryImage(listing: Listing): string {
    const primary = listing.images.find((image) => image.is_primary);
    return primary?.image_url || listing.images[0]?.image_url || '';
  }
}
