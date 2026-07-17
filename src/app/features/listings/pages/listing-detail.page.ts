import { CurrencyPipe } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ListingsService } from '../../../core/services/listings.service';
import { ToastService } from '../../../core/services/toast.service';
import { CommercialSellerPublic, Listing } from '../../../core/models/listing.model';
import { CheckoutProvider } from '../../../core/models/order.model';

@Component({
  selector: 'app-listing-detail-page',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './listing-detail.page.html',
  styleUrls: ['./listing-detail.page.scss'],
})
export class ListingDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listingsService = inject(ListingsService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  readonly authService = inject(AuthService);

  readonly listing = signal<Listing | null>(null);
  readonly isLoading = signal(true);
  readonly actionText = signal('');
  readonly selectedImageUrl = signal('');
  readonly selectedImageIndex = signal(0);
  readonly isPreviewOpen = signal(false);

  constructor() {
    this.prepareScrollPosition();
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.loadListing(slug);
  }

  private prepareScrollPosition(): void {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    this.scrollToTop();
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  loadListing(slug: string): void {
    this.listingsService.detail(slug).subscribe({
      next: (listing) => this.setLoadedListing(listing),
      error: () => this.setMissingListing(),
    });
  }

  private setLoadedListing(listing: Listing): void {
    const imageUrl = this.primaryImageFrom(listing);
    this.listing.set(listing);
    this.selectedImageUrl.set(imageUrl);
    this.selectedImageIndex.set(this.imageIndexFromUrl(listing, imageUrl));
    this.finishLoading();
  }

  private setMissingListing(): void {
    this.listing.set(null);
    this.finishLoading();
  }

  private finishLoading(): void {
    this.isLoading.set(false);
    this.resetScrollAfterRender();
  }

  private resetScrollAfterRender(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.scrollToTop());
    });

    setTimeout(() => this.scrollToTop(), 120);
  }

  selectedImage(): string {
    return this.selectedImageUrl();
  }

  primaryImage(): string {
    return this.selectedImageUrl();
  }

  commercialSeller(): CommercialSellerPublic | null {
    return this.listing()?.commercial_seller ?? null;
  }

  commercialPhoneHref(phone: string): string {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
  }

  text(key: string): string {
    return this.i18n.t(key);
  }

  selectImage(imageUrl: string): void {
    const listing = this.listing();
    this.selectedImageUrl.set(imageUrl);
    if (listing) {
      this.selectedImageIndex.set(this.imageIndexFromUrl(listing, imageUrl));
    }
  }

  imagesCount(): number {
    return this.listing()?.images.length ?? 0;
  }

  selectedPreviewImage() {
    return this.listing()?.images[this.selectedImageIndex()] ?? null;
  }

  openImagePreview(index = this.selectedImageIndex()): void {
    if (!this.imagesCount()) {
      return;
    }
    this.selectPreviewImage(index);
    this.isPreviewOpen.set(true);
  }

  closeImagePreview(): void {
    this.isPreviewOpen.set(false);
  }

  showNextImage(): void {
    this.showImageByOffset(1);
  }

  showPreviousImage(): void {
    this.showImageByOffset(-1);
  }

  selectPreviewImage(index: number): void {
    const listing = this.listing();
    if (!listing?.images.length) {
      return;
    }
    const nextIndex = this.normalizeImageIndex(index);
    this.selectedImageIndex.set(nextIndex);
    this.selectedImageUrl.set(listing.images[nextIndex].image_url);
  }

  @HostListener('window:keydown', ['$event'])
  handlePreviewKeyboard(event: KeyboardEvent): void {
    if (!this.isPreviewOpen()) {
      return;
    }
    this.handlePreviewKey(event.key);
  }

  private handlePreviewKey(key: string): void {
    if (key === 'Escape') {
      this.closeImagePreview();
    }
    if (key === 'ArrowRight') {
      this.showNextImage();
    }
    if (key === 'ArrowLeft') {
      this.showPreviousImage();
    }
  }

  private primaryImageFrom(listing: Listing): string {
    const primary = listing.images.find((image) => image.is_primary);
    return primary?.image_url || listing.images[0]?.image_url || '';
  }

  private imageIndexFromUrl(listing: Listing, imageUrl: string): number {
    const index = listing.images.findIndex((image) => image.image_url === imageUrl);
    return index >= 0 ? index : 0;
  }

  private showImageByOffset(offset: number): void {
    const nextIndex = this.selectedImageIndex() + offset;
    this.selectPreviewImage(nextIndex);
  }

  private normalizeImageIndex(index: number): number {
    const count = this.imagesCount();
    return count ? (index + count) % count : 0;
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
    this.openCheckout('stripe');
  }

  buyWithPayPal(): void {
    this.openCheckout('paypal');
  }

  private openCheckout(provider: CheckoutProvider): void {
    const listing = this.listing();
    if (!listing) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.router.navigate(['/checkout', provider, listing.slug]);
  }
}
