import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ListingsService } from '../../../core/services/listings.service';
import { ToastService } from '../../../core/services/toast.service';
import { createAuthUser } from '../../../testing/auth-user.fixture';
import { createListing } from '../../../testing/listing.fixture';
import { CreateListingPage } from './create-listing.page';

const listingFormValue = {
  category: 2,
  title: 'Vintage jacket',
  slug: 'vintage-jacket',
  description: 'A vintage jacket in good condition.',
  price: '40.00',
  condition: 'good',
  status: 'pending_review' as const,
  city: 'Essen',
  country: 'Germany',
  is_featured: false,
};

describe('CreateListingPage', () => {
  const user = signal(createAuthUser());
  const router = { navigate: vi.fn() };
  const listingsService = {
    create: vi.fn(() => of(createListing())),
  };

  const categoriesService = {
    list: vi.fn(() => of([])),
  };

  const toastService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const i18nService = {
    t: vi.fn((key: string) => key),
  };

  let component: CreateListingPage;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [CreateListingPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: { user } },
        { provide: ListingsService, useValue: listingsService },
        { provide: CategoriesService, useValue: categoriesService },
        { provide: ToastService, useValue: toastService },
        { provide: I18nService, useValue: i18nService },
      ],
    })
      .overrideComponent(CreateListingPage, {
        set: { template: '' },
      })
      .compileComponents();

    component = TestBed.createComponent(CreateListingPage).componentInstance;

    component.form.setValue(listingFormValue);
  });

  it('forces draft creation for an unapproved commercial seller', () => {
    user.set(
      createAuthUser({
        seller_type: 'commercial',
        commercial_status: 'pending_review',
      }),
    );

    component.submit();

    expect(component.statusOptions()).toHaveLength(1);
    expect(listingsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft' }),
    );

    expect(router.navigate).toHaveBeenCalledWith(['/my-listings']);
  });

  it('allows a private seller to submit a listing for review', () => {
    user.set(createAuthUser());

    listingsService.create.mockReturnValue(of(createListing({ status: 'pending_review' })));

    component.submit();

    expect(component.statusOptions()).toHaveLength(2);
    expect(listingsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending_review' }),
    );

    expect(router.navigate).toHaveBeenCalledWith(['/my-listings']);
  });
});
