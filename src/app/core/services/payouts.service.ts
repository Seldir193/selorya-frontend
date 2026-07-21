import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { MarkPayoutPaidPayload, PayoutItem } from '../models/payout.model';

@Injectable({ providedIn: 'root' })
export class PayoutsService {
  private readonly http = inject(HttpClient);

  list(): Observable<PayoutItem[]> {
    return this.http.get<PayoutItem[]>(`${API_BASE_URL}/payouts/`);
  }

  markPaid(id: number, payload: MarkPayoutPaidPayload): Observable<PayoutItem> {
    return this.http.post<PayoutItem>(`${API_BASE_URL}/payouts/${id}/mark-paid/`, payload);
  }

  retry(id: number): Observable<PayoutItem> {
    return this.http.post<PayoutItem>(`${API_BASE_URL}/payouts/${id}/retry/`, {});
  }
}
