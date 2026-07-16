import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Favorite } from '../../../core/models/favorite.model';
import { FavoritesService } from '../../../core/services/favorites.service';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

type FavoriteStatusFilter = 'all' | 'published' | 'sold' | 'archived' | 'draft';
type FavoriteSortOption = 'saved_desc' | 'price_asc' | 'price_desc' | 'title_asc' | 'title_desc';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CurrencyPipe, DropdownComponent, PaginationComponent, RouterLink, TranslatePipe],
  templateUrl: './favorites.page.html',
  styleUrl: './favorites.page.scss',
})
export class FavoritesPage {
  private readonly favoritesService = inject(FavoritesService);
  private readonly translate = inject(TranslateService);
  private readonly languageChange = toSignal(this.translate.onLangChange, {
    initialValue: null,
  });

  readonly favorites = signal<Favorite[]>([]);
  readonly isLoading = signal(true);
  readonly hasLoadError = signal(false);
  readonly searchQuery = signal('');
  readonly statusFilter = signal<FavoriteStatusFilter>('all');
  readonly sortOption = signal<FavoriteSortOption>('saved_desc');
  readonly currentPage = signal(1);
  readonly pageSize = signal(12);
  readonly removingFavoriteId = signal<number | null>(null);
  readonly removeErrorFavoriteId = signal<number | null>(null);
  readonly failedImageFavoriteIds = signal<Set<number>>(new Set());

  readonly emptyIcon = '/assets/icons/favorites/favorite-empty.svg';
  readonly removeIcon = '/assets/icons/favorites/favorite-remove.svg';
  readonly locationIcon = '/assets/icons/listing/listing-location.svg';
  readonly imagePlaceholderIcon = '/assets/icons/listing/listing-image-placeholder.svg';
  readonly pageSizeOptions = [12, 24, 48];

  readonly statusDropdownOptions = computed(() => {
    this.languageChange();

    return [
      { value: 'all', label: this.text('favorites.status.all') },
      { value: 'published', label: this.text('favorites.status.published') },
      { value: 'sold', label: this.text('favorites.status.sold') },
      { value: 'archived', label: this.text('favorites.status.archived') },
      { value: 'draft', label: this.text('favorites.status.draft') },
    ];
  });

  readonly sortDropdownOptions = computed(() => {
    this.languageChange();

    return [
      {
        value: 'saved_desc',
        label: this.text('favorites.sort.recentlySaved'),
      },
      {
        value: 'price_asc',
        label: this.text('favorites.sort.priceLowToHigh'),
      },
      {
        value: 'price_desc',
        label: this.text('favorites.sort.priceHighToLow'),
      },
      {
        value: 'title_asc',
        label: this.text('favorites.sort.titleAsc'),
      },
      {
        value: 'title_desc',
        label: this.text('favorites.sort.titleDesc'),
      },
    ];
  });

  readonly hasActiveFilters = computed(() => {
    return Boolean(this.searchQuery().trim()) || this.statusFilter() !== 'all';
  });

  readonly filteredFavorites = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase();
    const status = this.statusFilter();

    const favorites = this.favorites().filter((favorite) => {
      return this.matchesSearch(favorite, query) && this.matchesStatus(favorite, status);
    });

    return this.sortFavorites(favorites);
  });

  readonly paginatedFavorites = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();

    return this.filteredFavorites().slice(startIndex, endIndex);
  });

  constructor() {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading.set(true);
    this.hasLoadError.set(false);
    this.failedImageFavoriteIds.set(new Set());

    this.favoritesService.list().subscribe({
      next: (favorites) => {
        this.favorites.set(favorites);
        this.isLoading.set(false);
      },
      error: () => {
        this.favorites.set([]);
        this.isLoading.set(false);
        this.hasLoadError.set(true);
      },
    });
  }

  setSearchQuery(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  setStatusFilter(value: string): void {
    if (this.isStatusFilter(value)) {
      this.statusFilter.set(value);
      this.currentPage.set(1);
    }
  }

  setSortOption(value: string): void {
    if (this.isSortOption(value)) {
      this.sortOption.set(value);
      this.currentPage.set(1);
    }
  }

  setPage(page: number): void {
    this.currentPage.set(Math.max(1, page));
  }

  setPageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.currentPage.set(1);
  }

  removeFavorite(favoriteId: number): void {
    if (this.removingFavoriteId() === favoriteId) {
      return;
    }

    this.removingFavoriteId.set(favoriteId);
    this.removeErrorFavoriteId.set(null);

    this.favoritesService.delete(favoriteId).subscribe({
      next: () => {
        this.favorites.update((favorites) => {
          return favorites.filter((favorite) => favorite.id !== favoriteId);
        });

        this.removingFavoriteId.set(null);
        this.ensureValidPage();
      },
      error: () => {
        this.removingFavoriteId.set(null);
        this.removeErrorFavoriteId.set(favoriteId);
      },
    });
  }

  imageSource(favorite: Favorite): string {
    const hasFailed = this.failedImageFavoriteIds().has(favorite.id);

    if (favorite.listing_data.primary_image_url && !hasFailed) {
      return favorite.listing_data.primary_image_url;
    }

    return this.imagePlaceholderIcon;
  }

  handleImageError(favoriteId: number): void {
    this.failedImageFavoriteIds.update((favoriteIds) => {
      return new Set([...favoriteIds, favoriteId]);
    });
  }

  location(favorite: Favorite): string {
    return [favorite.listing_data.city, favorite.listing_data.country].filter(Boolean).join(', ');
  }

  statusKey(status: string): string {
    return `favorites.status.${status}`;
  }

  isRemoving(favoriteId: number): boolean {
    return this.removingFavoriteId() === favoriteId;
  }

  private text(key: string): string {
    return this.translate.instant(key);
  }

  private matchesSearch(favorite: Favorite, query: string): boolean {
    if (!query) {
      return true;
    }

    const listing = favorite.listing_data;
    const searchableText = [
      listing.title,
      listing.category_name,
      listing.city,
      listing.country,
      listing.seller_name,
    ]
      .join(' ')
      .toLocaleLowerCase();

    return searchableText.includes(query);
  }

  private matchesStatus(favorite: Favorite, status: FavoriteStatusFilter): boolean {
    return status === 'all' || favorite.listing_data.status === status;
  }

  private sortFavorites(favorites: Favorite[]): Favorite[] {
    return [...favorites].sort((first, second) => {
      return this.sortFavorite(first, second);
    });
  }

  private sortFavorite(first: Favorite, second: Favorite): number {
    if (this.sortOption() === 'price_asc') {
      return Number(first.listing_data.price) - Number(second.listing_data.price);
    }

    if (this.sortOption() === 'price_desc') {
      return Number(second.listing_data.price) - Number(first.listing_data.price);
    }

    if (this.sortOption() === 'title_asc') {
      return first.listing_data.title.localeCompare(second.listing_data.title);
    }

    if (this.sortOption() === 'title_desc') {
      return second.listing_data.title.localeCompare(first.listing_data.title);
    }

    return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
  }

  private isStatusFilter(value: string): value is FavoriteStatusFilter {
    return ['all', 'published', 'sold', 'archived', 'draft'].includes(value);
  }

  private isSortOption(value: string): value is FavoriteSortOption {
    return ['saved_desc', 'price_asc', 'price_desc', 'title_asc', 'title_desc'].includes(value);
  }

  private ensureValidPage(): void {
    const totalPages = Math.max(1, Math.ceil(this.filteredFavorites().length / this.pageSize()));

    if (this.currentPage() > totalPages) {
      this.currentPage.set(totalPages);
    }
  }
}
