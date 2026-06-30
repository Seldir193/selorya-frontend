import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  CommercialSellerReview,
  CommercialStatus,
  CustomerProfile,
  SellerProfile,
  SellerProfileUpdatePayload,
} from '../models/auth.model';

type CustomerProfilePayload = {
  phone: string;
  city: string;
  country: string;
};

export type CommercialSellerListParams = {
  status?: CommercialStatus;
  search?: string;
};

type CommercialSellerDecisionPayload = {
  reason: string;
};

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  private readonly http = inject(HttpClient);

  updateSellerProfile(payload: SellerProfileUpdatePayload): Observable<SellerProfile> {
    return this.http.patch<SellerProfile>(`${API_BASE_URL}/profiles/seller/me/`, payload);
  }

  updateCustomerProfile(payload: CustomerProfilePayload): Observable<CustomerProfile> {
    return this.http.patch<CustomerProfile>(`${API_BASE_URL}/profiles/customer/me/`, payload);
  }

  requestCommercialReview(): Observable<SellerProfile> {
    return this.http.post<SellerProfile>(
      `${API_BASE_URL}/profiles/seller/me/commercial/review/`,
      {},
    );
  }

  listCommercialSellers(params?: CommercialSellerListParams): Observable<CommercialSellerReview[]> {
    return this.http.get<CommercialSellerReview[]>(
      `${API_BASE_URL}/profiles/seller/commercial/moderation/`,
      { params: this.commercialSellerParams(params) },
    );
  }

  approveCommercialSeller(profileId: number): Observable<CommercialSellerReview> {
    return this.http.post<CommercialSellerReview>(
      `${API_BASE_URL}/profiles/seller/commercial/${profileId}/approve/`,
      {},
    );
  }

  rejectCommercialSeller(profileId: number, reason: string): Observable<CommercialSellerReview> {
    return this.commercialDecision(profileId, 'reject', reason);
  }

  suspendCommercialSeller(profileId: number, reason: string): Observable<CommercialSellerReview> {
    return this.commercialDecision(profileId, 'suspend', reason);
  }

  private commercialDecision(
    profileId: number,
    action: 'reject' | 'suspend',
    reason: string,
  ): Observable<CommercialSellerReview> {
    const payload: CommercialSellerDecisionPayload = { reason };

    return this.http.post<CommercialSellerReview>(
      `${API_BASE_URL}/profiles/seller/commercial/${profileId}/${action}/`,
      payload,
    );
  }

  private commercialSellerParams(params?: CommercialSellerListParams): HttpParams {
    let httpParams = new HttpParams();

    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }

    if (params?.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }

    return httpParams;
  }
}

// import { Injectable, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { API_BASE_URL } from '../config/api.config';

// type SellerProfilePayload = {
//   display_name: string;
//   bio: string;
//   city: string;
//   country: string;
// };

// type CustomerProfilePayload = {
//   phone: string;
//   city: string;
//   country: string;
// };

// @Injectable({
//   providedIn: 'root',
// })
// export class ProfilesService {
//   private readonly http = inject(HttpClient);

//   updateSellerProfile(payload: SellerProfilePayload): Observable<unknown> {
//     return this.http.patch(`${API_BASE_URL}/profiles/seller/me/`, payload);
//   }

//   updateCustomerProfile(payload: CustomerProfilePayload): Observable<unknown> {
//     return this.http.patch(`${API_BASE_URL}/profiles/customer/me/`, payload);
//   }
// }
