import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../config/api.config';
import {
  ShipmentReturnRequestPayload,
  ShipmentReturnShippingPayload,
} from '../models/return.model';
import { ReturnsService } from './returns.service';


describe('ReturnsService', () => {
  let service: ReturnsService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReturnsService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('submits a statutory withdrawal for a shipment', () => {
    const payload: ShipmentReturnRequestPayload = {
      reason: 'change_of_mind',
      description: '',
    };
    service.requestReturn(8, payload).subscribe();
    const request = httpController.expectOne(`${API_BASE_URL}/orders/shipments/8/returns/`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 4 });
  });

  it('marks the return as shipped', () => {
    const payload: ShipmentReturnShippingPayload = {
      carrier: 'dhl',
      tracking_number: 'DHL-RETURN-8',
    };
    service.shipReturn(4, payload).subscribe();
    const request = httpController.expectOne(`${API_BASE_URL}/orders/shipment-returns/4/ship/`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 4 });
  });

  it('confirms returned delivery with an empty body', () => {
    service.confirmReturnDelivery(4).subscribe();
    const request = httpController.expectOne(
      `${API_BASE_URL}/orders/shipment-returns/4/confirm-delivery/`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush({ id: 4 });
  });
});
