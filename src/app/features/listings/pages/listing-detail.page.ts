import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ListingsService } from '../../../core/services/listings.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { OrdersService } from '../../../core/services/orders.service';
import { AuthService } from '../../../core/services/auth.service';
import { Listing } from '../../../core/models/listing.model';
import { ToastService } from '../../../core/services/toast.service';
import { I18nService } from '../../../core/services/i18n.service';

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
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly listing = signal<Listing | null>(null);
  readonly isLoading = signal(true);
  readonly actionText = signal('');

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.loadListing(slug);
  }

  selectedImage(): string {
    return this.primaryImage();
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
        this.actionText.set(this.i18n.t('favoriteAdded'));
        this.toast.success(this.i18n.t('favoriteAdded'));
      },
      error: () => {
        this.actionText.set(this.i18n.t('favoriteFailed'));
        this.toast.error(this.i18n.t('favoriteFailed'));
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
              this.actionText.set(this.i18n.t('stripeStartFailed'));
              this.toast.error(this.i18n.t('stripeStartFailed'));
            },
          });
          return;
        }

        this.ordersService.startPayPalCheckout(order.id).subscribe({
          next: (response) => {
            window.location.href = response.approve_url;
          },
          error: () => {
            this.actionText.set(this.i18n.t('paypalStartFailed'));
            this.toast.error(this.i18n.t('paypalStartFailed'));
          },
        });
      },
      error: () => {
        this.actionText.set(this.i18n.t('orderCreateFailed'));
        this.toast.error(this.i18n.t('orderCreateFailed'));
      },
    });
  }
}
