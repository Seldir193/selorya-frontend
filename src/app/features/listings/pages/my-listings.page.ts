import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ListingsService } from '../../../core/services/listings.service';
import { Listing } from '../../../core/models/listing.model';

@Component({
  selector: 'app-my-listings-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './my-listings.page.html',
  styleUrls: ['./my-listings.page.scss'],
})
export class MyListingsPage {
  private readonly listingsService = inject(ListingsService);

  readonly listings = signal<Listing[]>([]);
  readonly isLoading = signal(true);

  constructor() {
    this.loadListings();
  }

  loadListings(): void {
    this.listingsService.myListings().subscribe({
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
}
