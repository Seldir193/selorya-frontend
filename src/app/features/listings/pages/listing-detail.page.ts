import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ListingsService } from '../../../core/services/listings.service';
import { Listing } from '../../../core/models/listing.model';

@Component({
  selector: 'app-listing-detail-page',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './listing-detail.page.html',
  styleUrl: './listing-detail.page.scss',
})
export class ListingDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly listingsService = inject(ListingsService);

  readonly listing = signal<Listing | null>(null);
  readonly isLoading = signal(true);

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.loadListing(slug);
  }

  loadListing(slug: string): void {
    this.listingsService.detail(slug).subscribe({
      next: (listing) => {
        this.listing.set(listing);
        this.isLoading.set(false);
      },
      error: () => {
        this.listing.set(null);
        this.isLoading.set(false);
      },
    });
  }

  primaryImage(): string {
    const listing = this.listing();
    if (!listing) {
      return '';
    }

    const primary = listing.images.find((image) => image.is_primary);
    return primary?.image_url || listing.images[0]?.image_url || '';
  }
}
