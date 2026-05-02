import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  Order,
  OrderScope,
  PayPalCheckoutResponse,
  StripeCheckoutResponse,
} from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly http = inject(HttpClient);

  list(scope: OrderScope = 'purchased'): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_BASE_URL}/orders/`, {
      params: { scope },
    });
  }

  detail(id: number): Observable<Order> {
    return this.http.get<Order>(`${API_BASE_URL}/orders/${id}/`);
  }

  create(listingId: number, quantity = 1): Observable<Order> {
    return this.http.post<Order>(`${API_BASE_URL}/orders/create/`, {
      listing_id: listingId,
      quantity,
    });
  }

  startStripeCheckout(orderId: number): Observable<StripeCheckoutResponse> {
    return this.http.post<StripeCheckoutResponse>(`${API_BASE_URL}/payments/stripe/checkout/`, {
      order_id: orderId,
    });
  }

  startPayPalCheckout(orderId: number): Observable<PayPalCheckoutResponse> {
    return this.http.post<PayPalCheckoutResponse>(`${API_BASE_URL}/payments/paypal/create-order/`, {
      order_id: orderId,
    });
  }
}
