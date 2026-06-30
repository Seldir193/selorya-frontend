import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../config/api.config';
import { ProfilesService } from './profiles.service';

const profileResponse = {
  id: 8,
  commercial_status: 'pending_review',
};

describe('ProfilesService', () => {
  let service: ProfilesService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProfilesService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('posts an empty review request payload', () => {
    service.requestCommercialReview().subscribe();

    const request = httpController.expectOne(
      `${API_BASE_URL}/profiles/seller/me/commercial/review/`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush(profileResponse);
  });

  it('serializes commercial moderation filters', () => {
    service
      .listCommercialSellers({
        status: 'pending_review',
        search: ' seller ',
      })
      .subscribe();

    const request = httpController.expectOne(
      `${API_BASE_URL}/profiles/seller/commercial/moderation/?status=pending_review&search=seller`,
    );

    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('posts a rejection reason to the review action', () => {
    service.rejectCommercialSeller(8, 'Incomplete business details').subscribe();

    const request = httpController.expectOne(
      `${API_BASE_URL}/profiles/seller/commercial/8/reject/`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      reason: 'Incomplete business details',
    });

    request.flush(profileResponse);
  });
});
