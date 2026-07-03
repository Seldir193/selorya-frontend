import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../config/api.config';
import { ListingsService } from './listings.service';

describe('ListingsService', () => {
  let service: ListingsService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ListingsService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
    localStorage.clear();
  });

  it('serializes listing moderation filters', () => {
    service
      .listForModeration({
        status: 'pending_review',
        search: ' seller ',
      })
      .subscribe();

    const request = httpController.expectOne(
      `${API_BASE_URL}/listings/moderation/?status=pending_review&search=seller`,
    );

    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('posts an empty payload when approving a listing', () => {
    service.approveModeration('vintage-jacket').subscribe();

    const request = httpController.expectOne(
      `${API_BASE_URL}/listings/vintage-jacket/moderation/approve/`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush({
      slug: 'vintage-jacket',
      status: 'published',
    });
  });

  it('posts a rejection reason when rejecting a listing', () => {
    service
      .rejectModeration('vintage-jacket', 'Product details do not match the category.')
      .subscribe();

    const request = httpController.expectOne(
      `${API_BASE_URL}/listings/vintage-jacket/moderation/reject/`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      reason: 'Product details do not match the category.',
    });

    request.flush({
      slug: 'vintage-jacket',
      status: 'rejected',
    });
  });
});
