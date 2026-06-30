import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nService } from '../../../core/services/i18n.service';
import { ListingsService } from '../../../core/services/listings.service';
import { createListing } from '../../../testing/listing.fixture';
import { MyListingsPage } from './my-listings.page';

const listings = [
  createListing({
    id: 1,
    status: 'pending_review',
    title: 'Review listing',
  }),
  createListing({
    id: 2,
    status: 'rejected',
    title: 'Rejected listing',
    moderation_reason: 'Missing details',
  }),
  createListing({
    id: 3,
    status: 'blocked',
    title: 'Blocked listing',
    moderation_reason: 'Policy violation',
  }),
];

describe('MyListingsPage', () => {
  const listingsService = {
    myListings: vi.fn(() => of(listings)),
  };

  const i18nService = {
    current: vi.fn(() => 'en'),
    t: vi.fn((key: string) => key),
  };

  let component: MyListingsPage;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MyListingsPage],
      providers: [
        { provide: ListingsService, useValue: listingsService },
        { provide: I18nService, useValue: i18nService },
      ],
    })
      .overrideComponent(MyListingsPage, {
        set: { template: '' },
      })
      .compileComponents();

    component = TestBed.createComponent(MyListingsPage).componentInstance;
  });

  it('filters the seller list by rejected moderation status', () => {
    component.changeStatus('rejected');

    expect(component.filteredListings()).toEqual([expect.objectContaining({ status: 'rejected' })]);
  });

  it('uses the display label for listings under review', () => {
    expect(component.listingStatusLabel('pending_review')).toBe('listingStatusPendingReviewLabel');
  });

  it('shows moderation reasons for rejected and blocked listings', () => {
    expect(component.showModerationReason(listings[1])).toBe(true);
    expect(component.showModerationReason(listings[2])).toBe(true);
  });
});
