import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Listing } from '../core/models/listing.model';
import { I18nService } from '../core/services/i18n.service';
import { ListingsService } from '../core/services/listings.service';
import { formatMoney } from '../core/utils/format.utils';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly listingsService = inject(ListingsService);
  private readonly i18n = inject(I18nService);

  readonly listings = signal<Listing[]>([]);
  readonly isLoading = signal(true);

  readonly previewListings = computed(() => {
    return this.listings().slice(0, 8);
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

  private loadListings(): void {
    this.listingsService.list().subscribe({
      next: (listings) => this.setListings(listings),
      error: () => this.clearListings(),
    });
  }

  private setListings(listings: Listing[]): void {
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
