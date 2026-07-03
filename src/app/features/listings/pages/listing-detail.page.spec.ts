import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NEVER } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommercialSellerPublic } from '../../../core/models/listing.model';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ListingsService } from '../../../core/services/listings.service';
import { OrdersService } from '../../../core/services/orders.service';
import { ToastService } from '../../../core/services/toast.service';
import { createListing } from '../../../testing/listing.fixture';
import { ListingDetailPage } from './listing-detail.page';

const commercialSeller: CommercialSellerPublic = {
  legal_name: 'Selorya GmbH',
  legal_form: 'GmbH',
  representative_name: 'Selcuk Kocyigit',
  email: 'office@selorya.example',
  phone: '+49 176 432 03 362',
  address_line_1: 'Marktstraße 1',
  address_line_2: '',
  postal_code: '45127',
  city: 'Essen',
  country: 'Germany',
  register_court: 'Amtsgericht Essen',
  register_number: 'HRB 12345',
  vat_id: 'DE123456789',
};

describe('ListingDetailPage', () => {
  const authService = {
    user: signal(null),
    isAuthenticated: vi.fn(() => false),
  };

  const router = {
    navigateByUrl: vi.fn(),
  };

  const listingsService = {
    detail: vi.fn(() => NEVER),
  };

  const favoritesService = {
    create: vi.fn(),
  };

  const ordersService = {
    create: vi.fn(),
    startStripeCheckout: vi.fn(),
    startPayPalCheckout: vi.fn(),
  };

  const toastService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const i18nService = {
    t: vi.fn((key: string) => key),
  };

  let component: ListingDetailPage;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [ListingDetailPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: vi.fn(() => 'vintage-jacket'),
              },
            },
          },
        },
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
        { provide: ListingsService, useValue: listingsService },
        { provide: FavoritesService, useValue: favoritesService },
        { provide: OrdersService, useValue: ordersService },
        { provide: ToastService, useValue: toastService },
        { provide: I18nService, useValue: i18nService },
      ],
    })
      .overrideComponent(ListingDetailPage, {
        set: { template: '' },
      })
      .compileComponents();

    component = TestBed.createComponent(ListingDetailPage).componentInstance;
  });

  it('exposes approved commercial seller data', () => {
    component.listing.set(createCommercialListing());

    expect(listingsService.detail).toHaveBeenCalledWith('vintage-jacket');
    expect(component.commercialSeller()).toEqual(commercialSeller);
  });

  it('hides commercial seller data for a private listing', () => {
    component.listing.set(createListing());

    expect(component.commercialSeller()).toBeNull();
  });

  it('creates a safe phone link for commercial contact data', () => {
    const phoneHref = component.commercialPhoneHref(commercialSeller.phone);

    expect(phoneHref).toBe('tel:+4917643203362');
  });

  function createCommercialListing() {
    return createListing({
      seller_type: 'commercial',
      commercial_seller: commercialSeller,
    });
  }
});
