import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Listing } from '../models/listing.model';

type ListingListParams = {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ListingsService {
  private readonly http = inject(HttpClient);

  list(params?: ListingListParams): Observable<Listing[]> {
    let httpParams = new HttpParams();

    if (params?.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.minPrice) {
      httpParams = httpParams.set('min_price', params.minPrice);
    }
    if (params?.maxPrice) {
      httpParams = httpParams.set('max_price', params.maxPrice);
    }

    return this.http.get<Listing[]>(`${API_BASE_URL}/listings/`, {
      params: httpParams,
    });
  }

  detail(slug: string): Observable<Listing> {
    return this.http.get<Listing>(`${API_BASE_URL}/listings/${slug}/`);
  }

  myListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${API_BASE_URL}/listings/mine/`);
  }

  create(payload: {
    category: number;
    title: string;
    slug: string;
    description: string;
    price: string;
    condition: string;
    status: string;
    city: string;
    country: string;
    is_featured: boolean;
  }): Observable<Listing> {
    return this.http.post<Listing>(`${API_BASE_URL}/listings/create/`, payload);
  }

  uploadImage(
    slug: string,
    file: File,
    altText = '',
    sortOrder = 0,
    isPrimary = false,
  ): Observable<unknown> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt_text', altText);
    formData.append('sort_order', String(sortOrder));
    formData.append('is_primary', String(isPrimary));

    return this.http.post(`${API_BASE_URL}/listings/${slug}/images/create/`, formData);
  }
}
