import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../config/api.config';
import { PayoutsService } from './payouts.service';

describe('PayoutsService', () => {
  let http: HttpTestingController;
  let service: PayoutsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(PayoutsService);
  });

  afterEach(() => http.verify());

  it('loads payouts visible to the current user', () => {
    service.list().subscribe();
    http.expectOne(`${API_BASE_URL}/payouts/`).flush([]);
  });

  it('marks an eligible payout as paid', () => {
    service.markPaid(7, { external_reference: 'bank-123' }).subscribe();
    const request = http.expectOne(`${API_BASE_URL}/payouts/7/mark-paid/`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ external_reference: 'bank-123' });
    request.flush({});
  });
});
