import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Listing } from '../core/models/listing.model';
import { I18nService } from '../core/services/i18n.service';
import { ListingsService } from '../core/services/listings.service';
import { formatMoney } from '../core/utils/format.utils';
import { PaginationComponent } from '../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, PaginationComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly listingsService = inject(ListingsService);
  private readonly i18n = inject(I18nService);

  readonly listings = signal<Listing[]>(this.listingsService.getCachedListings());
  readonly isLoading = signal(!this.listings().length);
  readonly skeletonListings = [1, 2, 3, 4, 5, 6, 7, 8];
  readonly page = signal(1);
  readonly pageSize = signal(8);

  readonly totalItems = computed(() => {
    return this.listings().length;
  });

  readonly previewListings = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    const end = start + this.pageSize();

    return this.listings().slice(start, end);
  });

  constructor() {
    this.loadListings();
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  listingImage(listing: Listing): string {
    return listing.images[0]?.image_url || 'assets/icons/orders/orders.svg';
  }

  listingAlt(listing: Listing): string {
    return listing.images[0]?.alt_text || listing.title;
  }

  listingPrice(listing: Listing): string {
    return formatMoney(listing.price, 'EUR', this.i18n.current());
  }

  changePage(page: number): void {
    this.page.set(page);
  }

  private loadListings(): void {
    this.listingsService.list().subscribe({
      next: (listings) => this.setListings(listings),
      error: () => this.clearListings(),
    });
  }

  private setListings(listings: Listing[]): void {
    this.page.set(1);
    this.listings.set(listings);
    this.stopLoading();
  }

  private clearListings(): void {
    this.listings.set([]);
    this.stopLoading();
  }

  private stopLoading(): void {
    this.isLoading.set(false);
  }
}
// import { Component, computed, inject, signal } from '@angular/core';
// import { RouterLink } from '@angular/router';
// import { Listing } from '../core/models/listing.model';
// import { I18nService } from '../core/services/i18n.service';
// import { ListingsService } from '../core/services/listings.service';
// import { formatMoney } from '../core/utils/format.utils';

// @Component({
//   selector: 'app-home-page',
//   standalone: true,
//   imports: [RouterLink],
//   templateUrl: './home.page.html',
//   styleUrl: './home.page.scss',
// })
// export class HomePage {
//   private readonly listingsService = inject(ListingsService);
//   private readonly i18n = inject(I18nService);

//   readonly listings = signal<Listing[]>(this.listingsService.getCachedListings());
//   readonly isLoading = signal(!this.listings().length);
//   readonly skeletonListings = [1, 2, 3, 4, 5, 6, 7, 8];
//   readonly totalItems = computed(() => {
//     return this.listings().length;
//   });

//   readonly previewListings = computed(() => {
//     // const start = (this.page() - 1) * this.pageSize();
//     // const end = start + this.pageSize();
//     return this.listings().slice(0, 8);
//     // return this.listings().slice(start, end);
//   });

//   constructor() {
//     this.loadListings();
//   }

//   text(key: string): string {
//     return this.i18n.t(key);
//   }

//   listingImage(listing: Listing): string {
//     return listing.images[0]?.image_url || 'assets/icons/orders/orders.svg';
//   }

//   listingAlt(listing: Listing): string {
//     return listing.images[0]?.alt_text || listing.title;
//   }

//   listingPrice(listing: Listing): string {
//     return formatMoney(listing.price, 'EUR', this.i18n.current());
//   }

//   private loadListings(): void {
//     this.listingsService.list().subscribe({
//       next: (listings) => this.setListings(listings),
//       error: () => this.clearListings(),
//     });
//   }

//   private setListings(listings: Listing[]): void {
//     // this.page.set(1);
//     this.listings.set(listings);
//     this.stopLoading();
//   }

//   private clearListings(): void {
//     this.listings.set([]);
//     this.stopLoading();
//   }

//   private stopLoading(): void {
//     this.isLoading.set(false);
//   }
// }
