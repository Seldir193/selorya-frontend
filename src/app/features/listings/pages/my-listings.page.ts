import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListingsService } from '../../../core/services/listings.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Listing } from '../../../core/models/listing.model';
import { formatDisplayDateOnly, formatMoney } from '../../../core/utils/format.utils';
import {
  DropdownComponent,
  DropdownOption,
} from '../../../shared/components/dropdown/dropdown.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

type ListingStatusFilter = 'all' | 'published' | 'draft' | 'sold' | 'archived';

type ListingSortOption =
  | 'recentlyUpdated'
  | 'oldestUpdated'
  | 'priceHighToLow'
  | 'priceLowToHigh'
  | 'titleAz'
  | 'titleZa';

@Component({
  selector: 'app-my-listings-page',
  standalone: true,
  imports: [RouterLink, DropdownComponent, PaginationComponent],
  templateUrl: './my-listings.page.html',
  styleUrls: ['./my-listings.page.scss'],
})
export class MyListingsPage {
  private readonly listingsService = inject(ListingsService);
  private readonly i18n = inject(I18nService);

  private readonly statusTextKeys: Record<string, string> = {
    draft: 'listingStatusDraft',
    published: 'listingStatusPublished',
    sold: 'listingStatusSold',
    archived: 'listingStatusArchived',
  };

  private readonly conditionTextKeys: Record<string, string> = {
    new: 'listingConditionNew',
    like_new: 'listingConditionLikeNew',
    very_good: 'listingConditionVeryGood',
    good: 'listingConditionGood',
    acceptable: 'listingConditionAcceptable',
  };

  readonly listings = signal<Listing[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly activeStatus = signal<ListingStatusFilter>('all');
  readonly searchQuery = signal('');
  readonly sortOption = signal<ListingSortOption>('recentlyUpdated');
  readonly currentPage = signal(1);
  readonly pageSize = signal(12);
  readonly failedImageListingIds = signal<Set<number>>(new Set());

  readonly statusFilters: ListingStatusFilter[] = ['all', 'published', 'draft', 'sold', 'archived'];

  readonly sortOptions: ListingSortOption[] = [
    'recentlyUpdated',
    'oldestUpdated',
    'priceHighToLow',
    'priceLowToHigh',
    'titleAz',
    'titleZa',
  ];

  readonly pageSizeOptions = [12, 24, 48];
  readonly skeletonCards = Array.from({ length: 6 });

  readonly listingEmptyIconSrc = '/assets/icons/listing/listing-empty.svg';
  readonly listingFallbackImageSrc = '/assets/icons/listing/listing-image-placeholder.svg';
  readonly listingConditionIconSrc = '/assets/icons/listing/listing-condition.svg';
  readonly listingLocationIconSrc = '/assets/icons/listing/listing-location.svg';
  readonly listingEditIconSrc = '/assets/icons/listing/listing-edit.svg';

  readonly statusDropdownOptions = computed<DropdownOption<ListingStatusFilter>[]>(() => {
    return this.statusFilters.map((status) => ({
      value: status,
      label: this.statusDropdownLabel(status),
    }));
  });

  readonly sortDropdownOptions = computed<DropdownOption<ListingSortOption>[]>(() => {
    return this.sortOptions.map((option) => ({
      value: option,
      label: this.sortLabel(option),
    }));
  });

  readonly filteredListings = computed(() => {
    return this.sortListings(this.filterListings(this.listings()));
  });

  readonly paginatedListings = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredListings().slice(start, start + this.pageSize());
  });

  readonly hasActiveFilters = computed(() => {
    return (
      this.activeStatus() !== 'all' ||
      this.searchQuery().trim() !== '' ||
      this.sortOption() !== 'recentlyUpdated'
    );
  });

  constructor() {
    this.loadListings();
  }

  loadListings(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.listingsService.myListings().subscribe({
      next: (listings) => this.setListings(listings),
      error: () => this.handleLoadError(),
    });
  }

  changeStatus(status: ListingStatusFilter): void {
    if (this.activeStatus() === status) {
      return;
    }

    this.activeStatus.set(status);
    this.resetPage();
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
    this.resetPage();
  }

  changeSortOption(option: ListingSortOption): void {
    this.sortOption.set(option);
    this.resetPage();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
  }

  changePageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.resetPage();
  }

  clearFilters(): void {
    this.activeStatus.set('all');
    this.searchQuery.set('');
    this.sortOption.set('recentlyUpdated');
    this.resetPage();
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  listingStatusLabel(status: string): string {
    const key = this.statusTextKeys[status];
    return key ? this.text(key) : status;
  }

  conditionLabel(condition: string): string {
    const key = this.conditionTextKeys[condition];
    return key ? this.text(key) : condition;
  }

  listingImageSrc(listing: Listing): string {
    const image = listing.images.find((item) => item.is_primary) ?? listing.images[0];
    return image?.image_url || image?.image || '';
  }

  hasDisplayImage(listing: Listing): boolean {
    return Boolean(this.listingImageSrc(listing)) && !this.failedImageListingIds().has(listing.id);
  }

  onImageError(listingId: number): void {
    this.failedImageListingIds.update((ids) => new Set(ids).add(listingId));
  }

  locationLabel(listing: Listing): string {
    const parts = [listing.city, listing.country].filter((value) => value.trim() !== '');
    return parts.length ? parts.join(', ') : this.text('myListingsLocationMissing');
  }

  listingPrice(listing: Listing): string {
    return formatMoney(listing.price, 'EUR', this.i18n.current());
  }

  listingUpdatedDate(listing: Listing): string {
    const value = listing.updated_at || listing.created_at;
    return value ? formatDisplayDateOnly(value, this.i18n.current()) : '';
  }

  canEditListing(listing: Listing): boolean {
    return ['draft', 'published', 'archived'].includes(listing.status);
  }

  resultsSummary(): string {
    const total = this.filteredListings().length;
    const from = total ? (this.currentPage() - 1) * this.pageSize() + 1 : 0;
    const to = Math.min(this.currentPage() * this.pageSize(), total);

    return this.interpolate(this.text('myListingsResultsSummary'), {
      from,
      to,
      total,
    });
  }

  private statusDropdownLabel(status: ListingStatusFilter): string {
    const label =
      status === 'all' ? this.text('myListingsTabAll') : this.listingStatusLabel(status);
    return `${label} (${this.statusCount(status)})`;
  }

  private statusCount(status: ListingStatusFilter): number {
    if (status === 'all') {
      return this.listings().length;
    }

    return this.listings().filter((listing) => listing.status === status).length;
  }

  private sortLabel(option: ListingSortOption): string {
    const key = `myListingsSort${option[0].toUpperCase()}${option.slice(1)}`;
    return this.text(key);
  }

  private filterListings(listings: Listing[]): Listing[] {
    return listings.filter((listing) => {
      return this.matchesStatus(listing) && this.matchesSearch(listing);
    });
  }

  private matchesStatus(listing: Listing): boolean {
    return this.activeStatus() === 'all' || listing.status === this.activeStatus();
  }

  private matchesSearch(listing: Listing): boolean {
    const query = this.searchQuery().trim().toLowerCase();
    return !query || this.searchableListingText(listing).includes(query);
  }

  private searchableListingText(listing: Listing): string {
    return [listing.title, listing.city, listing.country, listing.status, listing.condition]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  private sortListings(listings: Listing[]): Listing[] {
    const sortedListings = [...listings];

    if (this.sortOption() === 'oldestUpdated') {
      return sortedListings.sort((first, second) => this.compareUpdated(first, second));
    }

    if (this.sortOption() === 'priceHighToLow') {
      return sortedListings.sort((first, second) => this.comparePrice(second, first));
    }

    if (this.sortOption() === 'priceLowToHigh') {
      return sortedListings.sort((first, second) => this.comparePrice(first, second));
    }

    return this.sortByTextOrRecent(sortedListings);
  }

  private sortByTextOrRecent(listings: Listing[]): Listing[] {
    if (this.sortOption() === 'titleAz') {
      return listings.sort((first, second) => this.compareTitle(first, second));
    }

    if (this.sortOption() === 'titleZa') {
      return listings.sort((first, second) => this.compareTitle(second, first));
    }

    return listings.sort((first, second) => this.compareUpdated(second, first));
  }

  private compareUpdated(first: Listing, second: Listing): number {
    return this.timestamp(first) - this.timestamp(second);
  }

  private comparePrice(first: Listing, second: Listing): number {
    return Number(first.price) - Number(second.price);
  }

  private compareTitle(first: Listing, second: Listing): number {
    return first.title.localeCompare(second.title, this.i18n.current());
  }

  private timestamp(listing: Listing): number {
    return Date.parse(listing.updated_at || listing.created_at);
  }

  private setListings(listings: Listing[]): void {
    this.listings.set(listings);
    this.failedImageListingIds.set(new Set());
    this.isLoading.set(false);
    this.resetPage();
  }

  private handleLoadError(): void {
    this.listings.set([]);
    this.isLoading.set(false);
    this.hasError.set(true);
  }

  private resetPage(): void {
    this.currentPage.set(1);
  }

  private interpolate(template: string, values: Record<string, number>): string {
    return Object.entries(values).reduce((result, [key, value]) => {
      return result.split(`{{${key}}}`).join(String(value));
    }, template);
  }
}

// import { Component, inject, signal } from '@angular/core';
// import { RouterLink } from '@angular/router';
// import { CurrencyPipe } from '@angular/common';
// import { ListingsService } from '../../../core/services/listings.service';
// import { Listing } from '../../../core/models/listing.model';

// @Component({
//   selector: 'app-my-listings-page',
//   standalone: true,
//   imports: [RouterLink, CurrencyPipe],
//   templateUrl: './my-listings.page.html',
//   styleUrls: ['./my-listings.page.scss'],
// })
// export class MyListingsPage {
//   private readonly listingsService = inject(ListingsService);

//   readonly listings = signal<Listing[]>([]);
//   readonly isLoading = signal(true);

//   constructor() {
//     this.loadListings();
//   }

//   loadListings(): void {
//     this.listingsService.myListings().subscribe({
//       next: (listings) => {
//         this.listings.set(listings);
//         this.isLoading.set(false);
//       },
//       error: () => {
//         this.listings.set([]);
//         this.isLoading.set(false);
//       },
//     });
//   }
// }
