import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../config/api.config';
import {
  OrderCreatePayload,
  ShipmentDispatchPayload,
  ShippingSelectionPayload,
} from '../models/order.model';
import { OrdersService } from './orders.service';

const shipping: ShippingSelectionPayload = {
  shipping_option_id: 3,
  recipient_name: 'Selorya Buyer',
  address_line_1: 'Marktstraße 1',
  address_line_2: '',
  postal_code: '45127',
  city: 'Essen',
  country: 'Germany',
};

describe('OrdersService', () => {
  let service: OrdersService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrdersService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('loads orders for the selected personal scope', () => {
    service.list('all').subscribe();
    const request = httpController.expectOne(`${API_BASE_URL}/orders/?scope=all`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('loads the available shipping options', () => {
    service.shippingOptions().subscribe();
    const request = httpController.expectOne(`${API_BASE_URL}/orders/shipping-options/`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates an order with the selected shipping data', () => {
    const payload: OrderCreatePayload = { listing_id: 11, quantity: 1, shipping };
    service.create(payload).subscribe();
    const request = httpController.expectOne(`${API_BASE_URL}/orders/create/`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 44 });
  });

  it('updates shipping without creating another order', () => {
    service.selectShipping(44, shipping).subscribe();
    const request = httpController.expectOne(`${API_BASE_URL}/orders/44/shipment/select/`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(shipping);
    request.flush({ id: 9 });
  });

  it('dispatches a seller shipment with tracking', () => {
    const payload: ShipmentDispatchPayload = { status: 'shipped', tracking_number: 'DHL-42' };
    service.dispatchShipment(9, payload).subscribe();
    const request = httpController.expectOne(`${API_BASE_URL}/orders/shipments/9/dispatch/`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 9, status: 'shipped' });
  });

  it('starts checkout with the selected provider', () => {
    service.startCheckout('paypal', 44).subscribe();
    const request = httpController.expectOne(`${API_BASE_URL}/payments/paypal/create-order/`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ order_id: 44 });
    request.flush({ provider: 'paypal', approve_url: 'https://paypal.example/approve' });
  });
});
