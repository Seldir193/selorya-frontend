import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ListingsService } from '../../../core/services/listings.service';
import { ToastService } from '../../../core/services/toast.service';
import { createAuthUser } from '../../../testing/auth-user.fixture';
import { createListing } from '../../../testing/listing.fixture';
import { EditListingPage } from './edit-listing.page';

const rejectedListing = createListing({
  status: 'rejected',
  moderation_reason: 'Please improve the product description.',
});

describe('EditListingPage', () => {
  const user = signal(
    createAuthUser({
      seller_type: 'commercial',
      commercial_status: 'pending_review',
    }),
  );

  const router = {
    navigate: vi.fn(),
    navigateByUrl: vi.fn(),
  };

  const listingsService = {
    getCachedListing: vi.fn(() => null),
    manageDetail: vi.fn(() => of(rejectedListing)),
    update: vi.fn(() => of(createListing({ status: 'draft' }))),
  };

  const categoriesService = {
    getCachedCategories: vi.fn(() => []),
    list: vi.fn(() => of([])),
  };

  const toastService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const i18nService = {
    t: vi.fn((key: string) => key),
  };

  let component: EditListingPage;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [EditListingPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: { user } },
        { provide: ListingsService, useValue: listingsService },
        { provide: CategoriesService, useValue: categoriesService },
        { provide: ToastService, useValue: toastService },
        { provide: I18nService, useValue: i18nService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                slug: 'vintage-jacket',
              }),
            },
          },
        },
      ],
    })
      .overrideComponent(EditListingPage, {
        set: { template: '' },
      })
      .compileComponents();

    component = TestBed.createComponent(EditListingPage).componentInstance;
  });

  it('normalizes a rejected commercial listing to a draft update', () => {
    component.submit();

    expect(component.form.controls.status.value).toBe('draft');
    expect(component.statusOptions()).toHaveLength(1);

    expect(listingsService.update).toHaveBeenCalledWith(
      'vintage-jacket',
      expect.objectContaining({ status: 'draft' }),
    );

    expect(router.navigate).toHaveBeenCalledWith(['/my-listings']);
  });

  it('exposes a rejected listing moderation reason', () => {
    expect(component.showModerationReason()).toBe(true);
    expect(component.moderationReason()).toBe('Please improve the product description.');
  });
});
