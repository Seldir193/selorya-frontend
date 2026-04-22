import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ListingsService } from '../../../core/services/listings.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { OrdersService } from '../../../core/services/orders.service';
import { AuthService } from '../../../core/services/auth.service';
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
  private readonly router = inject(Router);
  private readonly listingsService = inject(ListingsService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly ordersService = inject(OrdersService);
  readonly authService = inject(AuthService);

  readonly listing = signal<Listing | null>(null);
  readonly isLoading = signal(true);
  readonly actionText = signal('');

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

  addToFavorites(): void {
    const listing = this.listing();
    if (!listing) {
      return;
    }
    if (!this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.favoritesService.create(listing.id).subscribe({
      next: () => {
        this.actionText.set('Listing added to favorites.');
      },
      error: () => {
        this.actionText.set('Could not add listing to favorites.');
      },
    });
  }

  buyWithStripe(): void {
    this.createOrderAndCheckout('stripe');
  }

  buyWithPayPal(): void {
    this.createOrderAndCheckout('paypal');
  }

  private createOrderAndCheckout(provider: 'stripe' | 'paypal'): void {
    const listing = this.listing();
    if (!listing) {
      return;
    }
    if (!this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.ordersService.create(listing.id).subscribe({
      next: (order) => {
        if (provider === 'stripe') {
          this.ordersService.startStripeCheckout(order.id).subscribe({
            next: (response) => {
              window.location.href = response.checkout_url;
            },
            error: () => {
              this.actionText.set('Stripe checkout could not be started.');
            },
          });
          return;
        }

        this.ordersService.startPayPalCheckout(order.id).subscribe({
          next: (response) => {
            window.location.href = response.approve_url;
          },
          error: () => {
            this.actionText.set('PayPal checkout could not be started.');
          },
        });
      },
      error: () => {
        this.actionText.set('Order could not be created.');
      },
    });
  }
}
