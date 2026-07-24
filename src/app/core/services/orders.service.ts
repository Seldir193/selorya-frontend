import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  CheckoutProvider,
  CheckoutResponse,
  Order,
  OrderCreatePayload,
  OrderScope,
  PayPalCheckoutResponse,
  Shipment,
  ShipmentDispatchPayload,
  ShipmentIssuePayload,
  ShipmentIssueResolutionPayload,
  ShippingOption,
  ShippingSelectionPayload,
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

  shippingOptions(): Observable<ShippingOption[]> {
    return this.http.get<ShippingOption[]>(`${API_BASE_URL}/orders/shipping-options/`);
  }

  create(payload: OrderCreatePayload): Observable<Order> {
    return this.http.post<Order>(`${API_BASE_URL}/orders/create/`, payload);
  }

  selectShipping(orderId: number, shipping: ShippingSelectionPayload): Observable<Shipment> {
    return this.http.post<Shipment>(`${API_BASE_URL}/orders/${orderId}/shipment/select/`, shipping);
  }

  dispatchShipment(id: number, payload: ShipmentDispatchPayload): Observable<Shipment> {
    return this.http.patch<Shipment>(`${API_BASE_URL}/orders/shipments/${id}/dispatch/`, payload);
  }

  confirmDelivery(id: number): Observable<Order> {
    return this.http.post<Order>(`${API_BASE_URL}/orders/shipments/${id}/confirm-delivery/`, {});
  }

  reportShipmentIssue(id: number, payload: ShipmentIssuePayload): Observable<Order> {
    return this.http.post<Order>(`${API_BASE_URL}/orders/shipments/${id}/report-issue/`, payload);
  }

  respondShipmentIssue(id: number, payload: ShipmentIssueResolutionPayload): Observable<Order> {
    return this.http.post<Order>(`${API_BASE_URL}/orders/shipments/${id}/issue-response/`, payload);
  }

  refundPayment(id: number): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/payments/${id}/refund/`, { confirm: true });
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

  startCheckout(provider: CheckoutProvider, orderId: number): Observable<CheckoutResponse> {
    return provider === 'stripe'
      ? this.startStripeCheckout(orderId)
      : this.startPayPalCheckout(orderId);
  }
}
