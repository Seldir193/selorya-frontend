import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { ListingsService } from '../../../core/services/listings.service';
import { Category } from '../../../core/models/category.model';
import { Favorite } from '../../../core/models/favorite.model';
import { Listing } from '../../../core/models/listing.model';

@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './listings.page.html',
  styleUrls: ['./listings.page.scss'],
})
export class ListingsPage {
  private readonly router = inject(Router);
  private readonly categoriesService = inject(CategoriesService);
  private readonly listingsService = inject(ListingsService);
  private readonly favoritesService = inject(FavoritesService);

  readonly authService = inject(AuthService);
  readonly categories = signal<Category[]>([]);
  readonly listings = signal<Listing[]>([]);
  readonly favorites = signal<Favorite[]>([]);
  readonly selectedCategory = signal('');
  readonly search = signal('');
  readonly minPrice = signal('');
  readonly maxPrice = signal('');
  readonly isLoading = signal(true);
  readonly failedImageIds = signal<Set<number>>(new Set());

  readonly listingPlaceholderIconSrc = '/assets/icons/listing/listing-image-placeholder.svg';
  readonly listingLocationIconSrc = '/assets/icons/listing/listing-location.svg';

  readonly filteredListings = computed(() => this.listings());

  constructor() {
    this.loadCategories();
    this.loadListings();
    this.loadFavorites();
  }

  loadCategories(): void {
    this.categoriesService.list().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
    });
  }

  loadFavorites(): void {
    if (!this.authService.isAuthenticated()) {
      this.favorites.set([]);
      return;
    }

    this.favoritesService.list().subscribe({
      next: (favorites) => {
        this.favorites.set(favorites);
      },
    });
  }

  loadListings(): void {
    this.isLoading.set(true);
    this.failedImageIds.set(new Set());

    this.listingsService
      .list({
        category: this.selectedCategory() || undefined,
        search: this.search() || undefined,
        minPrice: this.minPrice() || undefined,
        maxPrice: this.maxPrice() || undefined,
      })
      .subscribe({
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
    this.loadListings();
  }

  updateSearch(value: string): void {
    this.search.set(value);
  }

  updateMinPrice(value: string): void {
    this.minPrice.set(value);
  }

  updateMaxPrice(value: string): void {
    this.maxPrice.set(value);
  }

  applyFilters(): void {
    this.loadListings();
  }

  isFavorite(listingId: number): boolean {
    return this.favorites().some((favorite) => favorite.listing === listingId);
  }

  toggleFavorite(listingId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const favorite = this.favorites().find((item) => item.listing === listingId);

    if (favorite) {
      this.favoritesService.delete(favorite.id).subscribe({
        next: () => {
          this.favorites.update((items) => {
            return items.filter((item) => item.id !== favorite.id);
          });
        },
      });
      return;
    }

    this.favoritesService.create(listingId).subscribe({
      next: (created) => {
        this.favorites.update((items) => [created, ...items]);
      },
    });
  }

  primaryImage(listing: Listing): string {
    const primary = listing.images.find((image) => image.is_primary);
    return primary?.image_url || listing.images[0]?.image_url || '';
  }

  hasListingImage(listing: Listing): boolean {
    return Boolean(this.primaryImage(listing)) && !this.failedImageIds().has(listing.id);
  }

  onImageError(listingId: number): void {
    this.failedImageIds.update((imageIds) => {
      return new Set([...imageIds, listingId]);
    });
  }

  locationLabel(listing: Listing): string {
    return [listing.city, listing.country].filter(Boolean).join(', ');
  }
}

// import { Component, computed, inject, signal } from '@angular/core';
// import { Router, RouterLink } from '@angular/router';
// import { CurrencyPipe } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { CategoriesService } from '../../../core/services/categories.service';
// import { ListingsService } from '../../../core/services/listings.service';
// import { FavoritesService } from '../../../core/services/favorites.service';
// import { AuthService } from '../../../core/services/auth.service';
// import { Category } from '../../../core/models/category.model';
// import { Listing } from '../../../core/models/listing.model';
// import { Favorite } from '../../../core/models/favorite.model';

// @Component({
//   selector: 'app-listings-page',
//   standalone: true,
//   imports: [RouterLink, CurrencyPipe, FormsModule],
//   templateUrl: './listings.page.html',
//   styleUrls: ['./listings.page.scss'],
// })
// export class ListingsPage {
//   private readonly router = inject(Router);
//   private readonly categoriesService = inject(CategoriesService);
//   private readonly listingsService = inject(ListingsService);
//   private readonly favoritesService = inject(FavoritesService);
//   readonly authService = inject(AuthService);

//   readonly categories = signal<Category[]>([]);
//   readonly listings = signal<Listing[]>([]);
//   readonly favorites = signal<Favorite[]>([]);
//   readonly selectedCategory = signal('');
//   readonly search = signal('');
//   readonly minPrice = signal('');
//   readonly maxPrice = signal('');
//   readonly isLoading = signal(true);

//   readonly filteredListings = computed(() => this.listings());

//   constructor() {
//     this.loadCategories();
//     this.loadListings();
//     this.loadFavorites();
//   }

//   loadCategories(): void {
//     this.categoriesService.list().subscribe({
//       next: (categories) => {
//         this.categories.set(categories);
//       },
//     });
//   }

//   loadFavorites(): void {
//     if (!this.authService.isAuthenticated()) {
//       this.favorites.set([]);
//       return;
//     }

//     this.favoritesService.list().subscribe({
//       next: (favorites) => {
//         this.favorites.set(favorites);
//       },
//     });
//   }

//   loadListings(): void {
//     this.isLoading.set(true);

//     this.listingsService
//       .list({
//         category: this.selectedCategory() || undefined,
//         search: this.search() || undefined,
//         minPrice: this.minPrice() || undefined,
//         maxPrice: this.maxPrice() || undefined,
//       })
//       .subscribe({
//         next: (listings) => {
//           this.listings.set(listings);
//           this.isLoading.set(false);
//         },
//         error: () => {
//           this.listings.set([]);
//           this.isLoading.set(false);
//         },
//       });
//   }

//   selectCategory(slug = ''): void {
//     this.selectedCategory.set(slug);
//     this.loadListings();
//   }

//   updateSearch(value: string): void {
//     this.search.set(value);
//   }

//   updateMinPrice(value: string): void {
//     this.minPrice.set(value);
//   }

//   updateMaxPrice(value: string): void {
//     this.maxPrice.set(value);
//   }

//   applyFilters(): void {
//     this.loadListings();
//   }

//   isFavorite(listingId: number): boolean {
//     return this.favorites().some((favorite) => favorite.listing === listingId);
//   }

//   toggleFavorite(listingId: number): void {
//     if (!this.authService.isAuthenticated()) {
//       this.router.navigateByUrl('/login');
//       return;
//     }

//     const favorite = this.favorites().find((item) => item.listing === listingId);

//     if (favorite) {
//       this.favoritesService.delete(favorite.id).subscribe({
//         next: () => {
//           this.favorites.update((items) => items.filter((item) => item.id !== favorite.id));
//         },
//       });
//       return;
//     }

//     this.favoritesService.create(listingId).subscribe({
//       next: (created) => {
//         this.favorites.update((items) => [created, ...items]);
//       },
//     });
//   }

//   primaryImage(listing: Listing): string {
//     const primary = listing.images.find((image) => image.is_primary);
//     return primary?.image_url || listing.images[0]?.image_url || '';
//   }
// }
