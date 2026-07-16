import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
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
    uploadImage: vi.fn(() => of({})),
    update: vi.fn(() => of(createListing({ status: 'published' }))),
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

  const providers = [
    { provide: Router, useValue: router },
    { provide: AuthService, useValue: { user } },
    { provide: ListingsService, useValue: listingsService },
    { provide: CategoriesService, useValue: categoriesService },
    { provide: ToastService, useValue: toastService },
    { provide: I18nService, useValue: i18nService },
  ];

  let component: CreateListingPage;

  function resetTestState(): void {
    user.set(createAuthUser());
    listingsService.create.mockReturnValue(of(createListing()));
    listingsService.uploadImage.mockReturnValue(of({}));
    listingsService.update.mockReturnValue(of(createListing({ status: 'published' })));
  }

  function expectDraftCreation(): void {
    expect(listingsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft' }),
    );
  }

  function expectFinalSubmission(): void {
    expect(listingsService.update).toHaveBeenCalledWith(
      'vintage-jacket',
      expect.objectContaining({ status: 'pending_review' }),
    );
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    resetTestState();

    await TestBed.configureTestingModule({
      imports: [CreateListingPage],
      providers,
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
    expectDraftCreation();
    expect(listingsService.update).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/my-listings']);
  });

  it('creates a draft before submitting a private listing', () => {
    component.submit();

    expect(component.statusOptions()).toHaveLength(2);
    expectDraftCreation();
    expectFinalSubmission();
    expect(router.navigate).toHaveBeenCalledWith(['/listings', 'vintage-jacket']);
  });

  it('waits for every image upload before final submission', () => {
    const upload = new Subject<object>();
    const file = new File(['image'], 'jacket.jpg', { type: 'image/jpeg' });
    listingsService.uploadImage.mockReturnValue(upload);
    component.selectedFiles.set([file]);
    component.submit();
    expect(listingsService.update).not.toHaveBeenCalled();
    upload.next({});
    upload.complete();
    expectFinalSubmission();
  });

  it('opens my listings when automatic moderation blocks the listing', () => {
    listingsService.update.mockReturnValue(of(createListing({ status: 'blocked' })));
    component.submit();
    expectDraftCreation();
    expectFinalSubmission();
    expect(router.navigate).toHaveBeenCalledWith(['/my-listings']);
  });
});
