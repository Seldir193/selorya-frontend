import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Listing } from '../models/listing.model';

type ListingListParams = {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
};

type ListingPayload = {
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
};

type ListingImagePayload = {
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class ListingsService {
  private readonly http = inject(HttpClient);
  private readonly listCacheKey = 'selorya_public_listings';

  getCachedListings(): Listing[] {
    const cachedListings = localStorage.getItem(this.listCacheKey);

    if (!cachedListings) {
      return [];
    }

    return this.parseCachedListings(cachedListings);
  }

  list(params?: ListingListParams): Observable<Listing[]> {
    const httpParams = this.buildListParams(params);

    return this.http
      .get<Listing[]>(`${API_BASE_URL}/listings/`, {
        params: httpParams,
      })
      .pipe(tap((listings) => this.cachePublicListings(listings, params)));
  }

  detail(slug: string): Observable<Listing> {
    return this.http.get<Listing>(`${API_BASE_URL}/listings/${slug}/`);
  }

  myListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${API_BASE_URL}/listings/mine/`);
  }

  create(payload: ListingPayload): Observable<Listing> {
    return this.http.post<Listing>(`${API_BASE_URL}/listings/create/`, payload);
  }

  uploadImage(
    slug: string,
    file: File,
    altText = '',
    sortOrder = 0,
    isPrimary = false,
  ): Observable<unknown> {
    const formData = this.buildImageFormData(file, altText, sortOrder, isPrimary);
    return this.http.post(`${API_BASE_URL}/listings/${slug}/images/create/`, formData);
  }

  updateImage(imageId: number, payload: ListingImagePayload): Observable<unknown> {
    return this.http.patch(`${API_BASE_URL}/listings/images/${imageId}/update/`, payload);
  }

  deleteImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/listings/images/${imageId}/delete/`);
  }

  update(slug: string, payload: ListingPayload): Observable<Listing> {
    return this.http.patch<Listing>(`${API_BASE_URL}/listings/${slug}/update/`, payload);
  }

  delete(slug: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/listings/${slug}/delete/`);
  }

  private buildListParams(params?: ListingListParams): HttpParams {
    let httpParams = new HttpParams();

    httpParams = this.appendParam(httpParams, 'category', params?.category);
    httpParams = this.appendParam(httpParams, 'search', params?.search);
    httpParams = this.appendParam(httpParams, 'min_price', params?.minPrice);
    httpParams = this.appendParam(httpParams, 'max_price', params?.maxPrice);

    return httpParams;
  }

  private appendParam(params: HttpParams, key: string, value?: string): HttpParams {
    if (!value) {
      return params;
    }

    return params.set(key, value);
  }

  private buildImageFormData(
    file: File,
    altText: string,
    sortOrder: number,
    isPrimary: boolean,
  ): FormData {
    const formData = new FormData();

    formData.append('image', file);
    formData.append('alt_text', altText);
    formData.append('sort_order', String(sortOrder));
    formData.append('is_primary', String(isPrimary));

    return formData;
  }

  private cachePublicListings(listings: Listing[], params?: ListingListParams): void {
    if (params) {
      return;
    }

    localStorage.setItem(this.listCacheKey, JSON.stringify(listings));
  }

  private parseCachedListings(cachedListings: string): Listing[] {
    try {
      return JSON.parse(cachedListings) as Listing[];
    } catch {
      localStorage.removeItem(this.listCacheKey);
      return [];
    }
  }
}
// import { Injectable, inject } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { API_BASE_URL } from '../config/api.config';
// import { Listing } from '../models/listing.model';

// type ListingListParams = {
//   category?: string;
//   search?: string;
//   minPrice?: string;
//   maxPrice?: string;
// };

// @Injectable({
//   providedIn: 'root',
// })
// export class ListingsService {
//   private readonly http = inject(HttpClient);

//   list(params?: ListingListParams): Observable<Listing[]> {
//     let httpParams = new HttpParams();

//     if (params?.category) {
//       httpParams = httpParams.set('category', params.category);
//     }
//     if (params?.search) {
//       httpParams = httpParams.set('search', params.search);
//     }
//     if (params?.minPrice) {
//       httpParams = httpParams.set('min_price', params.minPrice);
//     }
//     if (params?.maxPrice) {
//       httpParams = httpParams.set('max_price', params.maxPrice);
//     }

//     return this.http.get<Listing[]>(`${API_BASE_URL}/listings/`, {
//       params: httpParams,
//     });
//   }

//   detail(slug: string): Observable<Listing> {
//     return this.http.get<Listing>(`${API_BASE_URL}/listings/${slug}/`);
//   }

//   myListings(): Observable<Listing[]> {
//     return this.http.get<Listing[]>(`${API_BASE_URL}/listings/mine/`);
//   }

//   create(payload: {
//     category: number;
//     title: string;
//     slug: string;
//     description: string;
//     price: string;
//     condition: string;
//     status: string;
//     city: string;
//     country: string;
//     is_featured: boolean;
//   }): Observable<Listing> {
//     return this.http.post<Listing>(`${API_BASE_URL}/listings/create/`, payload);
//   }

//   uploadImage(
//     slug: string,
//     file: File,
//     altText = '',
//     sortOrder = 0,
//     isPrimary = false,
//   ): Observable<unknown> {
//     const formData = new FormData();
//     formData.append('image', file);
//     formData.append('alt_text', altText);
//     formData.append('sort_order', String(sortOrder));
//     formData.append('is_primary', String(isPrimary));

//     return this.http.post(`${API_BASE_URL}/listings/${slug}/images/create/`, formData);
//   }

//   updateImage(
//     imageId: number,
//     payload: {
//       alt_text: string;
//       sort_order: number;
//       is_primary: boolean;
//     },
//   ): Observable<unknown> {
//     return this.http.patch(`${API_BASE_URL}/listings/images/${imageId}/update/`, payload);
//   }

//   deleteImage(imageId: number): Observable<void> {
//     return this.http.delete<void>(`${API_BASE_URL}/listings/images/${imageId}/delete/`);
//   }

//   update(
//     slug: string,
//     payload: {
//       category: number;
//       title: string;
//       slug: string;
//       description: string;
//       price: string;
//       condition: string;
//       status: string;
//       city: string;
//       country: string;
//       is_featured: boolean;
//     },
//   ): Observable<Listing> {
//     return this.http.patch<Listing>(`${API_BASE_URL}/listings/${slug}/update/`, payload);
//   }

//   delete(slug: string): Observable<void> {
//     return this.http.delete<void>(`${API_BASE_URL}/listings/${slug}/delete/`);
//   }
// }
