import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

type SellerProfilePayload = {
  display_name: string;
  bio: string;
  city: string;
  country: string;
};

type CustomerProfilePayload = {
  phone: string;
  city: string;
  country: string;
};

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  private readonly http = inject(HttpClient);

  updateSellerProfile(payload: SellerProfilePayload): Observable<unknown> {
    return this.http.patch(`${API_BASE_URL}/profiles/seller/me/`, payload);
  }

  updateCustomerProfile(payload: CustomerProfilePayload): Observable<unknown> {
    return this.http.patch(`${API_BASE_URL}/profiles/customer/me/`, payload);
  }
}
