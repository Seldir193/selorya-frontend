import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nService } from '../../../core/services/i18n.service';
import { ListingsService } from '../../../core/services/listings.service';
import { ToastService } from '../../../core/services/toast.service';
import { createListing } from '../../../testing/listing.fixture';
import { AdminListingModerationPage } from './admin-listing-moderation.page';

const pendingListing = createListing({
  slug: 'vintage-jacket',
  status: 'pending_review',
});

describe('AdminListingModerationPage', () => {
  const listingsService = {
    listForModeration: vi.fn(() => of([pendingListing])),
    approveModeration: vi.fn(() => {
      return of({
        ...pendingListing,
        status: 'published' as const,
      });
    }),
    rejectModeration: vi.fn(() => {
      return of({
        ...pendingListing,
        status: 'rejected' as const,
      });
    }),
  };

  const toastService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const i18nService = {
    current: vi.fn(() => 'de'),
    t: vi.fn((key: string) => key),
  };

  let component: AdminListingModerationPage;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [AdminListingModerationPage],
      providers: [
        { provide: ListingsService, useValue: listingsService },
        { provide: ToastService, useValue: toastService },
        { provide: I18nService, useValue: i18nService },
      ],
    })
      .overrideComponent(AdminListingModerationPage, {
        set: { template: '' },
      })
      .compileComponents();

    component = TestBed.createComponent(AdminListingModerationPage).componentInstance;
  });

  it('loads pending listings for moderation', () => {
    expect(listingsService.listForModeration).toHaveBeenCalledWith({
      status: 'pending_review',
      search: '',
    });

    expect(component.listings()).toEqual([pendingListing]);
  });

  it('approves a pending listing and closes the dialog', () => {
    component.openDecisionDialog(pendingListing, 'approve');
    component.confirmDecision();

    expect(listingsService.approveModeration).toHaveBeenCalledWith(pendingListing.slug);

    expect(component.isDecisionDialogOpen()).toBe(false);
    expect(toastService.success).toHaveBeenCalledWith('adminListingModerationApproveSuccess');
  });

  it('requires a reason before rejecting a pending listing', () => {
    component.openDecisionDialog(pendingListing, 'reject');
    component.confirmDecision();

    expect(listingsService.rejectModeration).not.toHaveBeenCalled();

    component.decisionForm.controls.reason.setValue('The product category is incorrect.');

    component.confirmDecision();

    expect(listingsService.rejectModeration).toHaveBeenCalledWith(
      pendingListing.slug,
      'The product category is incorrect.',
    );

    expect(component.isDecisionDialogOpen()).toBe(false);
    expect(toastService.success).toHaveBeenCalledWith('adminListingModerationRejectSuccess');
  });
});
