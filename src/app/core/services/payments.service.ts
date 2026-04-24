import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Order } from '../models/order.model';

type PaymentItem = {
  id: number;
  order: number;
  order_id: number;
  buyer_email: string;
  provider: string;
  status: string;
  amount: string;
  currency: string;
  external_reference: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private readonly http = inject(HttpClient);

  list(): Observable<PaymentItem[]> {
    return this.http.get<PaymentItem[]>(`${API_BASE_URL}/payments/`);
  }

  capturePayPal(paymentId: number): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/payments/paypal/${paymentId}/capture/`, {});
  }

  findOrderBySessionId(sessionId: string): Observable<PaymentItem[]> {
    return this.list();
  }

  orderDetail(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${API_BASE_URL}/orders/${orderId}/`);
  }
}
