import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  MarkPayoutPaidPayload,
  PayPalPayoutAccountPayload,
  PayoutItem,
  PayoutOnboardingLink,
  PayoutOnboardingStatus,
  PayoutProviderAccount,
} from '../models/payout.model';

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

  onboardingStatus(): Observable<PayoutOnboardingStatus> {
    return this.http.get<PayoutOnboardingStatus>(
      `${API_BASE_URL}/payouts/stripe/onboarding/status/`,
    );
  }

  createOnboardingLink(): Observable<PayoutOnboardingLink> {
    return this.http.post<PayoutOnboardingLink>(
      `${API_BASE_URL}/payouts/stripe/onboarding/`,
      {},
    );
  }

  createStripeDashboardLink(): Observable<PayoutOnboardingLink> {
    return this.http.post<PayoutOnboardingLink>(`${API_BASE_URL}/payouts/stripe/dashboard/`, {});
  }

  paypalAccount(): Observable<PayoutProviderAccount> {
    return this.http.get<PayoutProviderAccount>(`${API_BASE_URL}/payouts/paypal/account/`);
  }

  savePaypalAccount(payload: PayPalPayoutAccountPayload): Observable<PayoutProviderAccount> {
    return this.http.put<PayoutProviderAccount>(`${API_BASE_URL}/payouts/paypal/account/`, payload);
  }

  deactivatePaypalAccount(): Observable<PayoutProviderAccount> {
    return this.http.delete<PayoutProviderAccount>(`${API_BASE_URL}/payouts/paypal/account/`);
  }
}
