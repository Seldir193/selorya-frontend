import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { PaymentItem, PaymentScope } from '../models/payment.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private readonly http = inject(HttpClient);

  list(scope: PaymentScope = 'purchased'): Observable<PaymentItem[]> {
    return this.http.get<PaymentItem[]>(`${API_BASE_URL}/payments/`, {
      params: { scope },
    });
  }

  capturePayPal(paymentId: number): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/payments/paypal/${paymentId}/capture/`, {});
  }

  findPaymentByReference(reference: string): Observable<PaymentItem[]> {
    return this.list();
  }
}
