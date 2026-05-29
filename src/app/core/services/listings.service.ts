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
  private readonly detailCacheKeyPrefix = 'selorya_listing_';

  getCachedListings(): Listing[] {
    const cachedListings = localStorage.getItem(this.listCacheKey);

    if (!cachedListings) {
      return [];
    }

    return this.parseCachedListings(cachedListings);
  }

  getCachedListing(slug: string): Listing | null {
    const cachedListing = localStorage.getItem(this.getDetailCacheKey(slug));

    if (!cachedListing) {
      return null;
    }

    return this.parseCachedListing(cachedListing, slug);
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
    return this.http
      .get<Listing>(`${API_BASE_URL}/listings/${slug}/`)
      .pipe(tap((listing) => this.cacheListing(listing)));
  }

  myListings(): Observable<Listing[]> {
    return this.http
      .get<Listing[]>(`${API_BASE_URL}/listings/mine/`)
      .pipe(tap((listings) => this.cacheListings(listings)));
  }

  create(payload: ListingPayload): Observable<Listing> {
    return this.http
      .post<Listing>(`${API_BASE_URL}/listings/create/`, payload)
      .pipe(tap((listing) => this.cacheListing(listing)));
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
    return this.http
      .patch<Listing>(`${API_BASE_URL}/listings/${slug}/update/`, payload)
      .pipe(tap((listing) => this.cacheUpdatedListing(slug, listing)));
  }

  delete(slug: string): Observable<void> {
    return this.http
      .delete<void>(`${API_BASE_URL}/listings/${slug}/delete/`)
      .pipe(tap(() => this.removeCachedListing(slug)));
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
    this.cacheListings(listings);
  }

  private cacheListings(listings: Listing[]): void {
    listings.forEach((listing) => this.cacheListing(listing));
  }

  private cacheListing(listing: Listing): void {
    localStorage.setItem(this.getDetailCacheKey(listing.slug), JSON.stringify(listing));
  }

  private cacheUpdatedListing(previousSlug: string, listing: Listing): void {
    this.removeCachedListing(previousSlug);
    this.cacheListing(listing);
  }

  private removeCachedListing(slug: string): void {
    localStorage.removeItem(this.getDetailCacheKey(slug));
  }

  private getDetailCacheKey(slug: string): string {
    return `${this.detailCacheKeyPrefix}${slug}`;
  }

  private parseCachedListings(cachedListings: string): Listing[] {
    try {
      return JSON.parse(cachedListings) as Listing[];
    } catch {
      localStorage.removeItem(this.listCacheKey);
      return [];
    }
  }

  private parseCachedListing(cachedListing: string, slug: string): Listing | null {
    try {
      return JSON.parse(cachedListing) as Listing;
    } catch {
      this.removeCachedListing(slug);
      return null;
    }
  }
}

// import { Injectable, inject } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable, tap } from 'rxjs';
// import { API_BASE_URL } from '../config/api.config';
// import { Listing } from '../models/listing.model';

// type ListingListParams = {
//   category?: string;
//   search?: string;
//   minPrice?: string;
//   maxPrice?: string;
// };

// type ListingPayload = {
//   category: number;
//   title: string;
//   slug: string;
//   description: string;
//   price: string;
//   condition: string;
//   status: string;
//   city: string;
//   country: string;
//   is_featured: boolean;
// };

// type ListingImagePayload = {
//   alt_text: string;
//   sort_order: number;
//   is_primary: boolean;
// };

// @Injectable({
//   providedIn: 'root',
// })
// export class ListingsService {
//   private readonly http = inject(HttpClient);
//   private readonly listCacheKey = 'selorya_public_listings';

//   getCachedListings(): Listing[] {
//     const cachedListings = localStorage.getItem(this.listCacheKey);

//     if (!cachedListings) {
//       return [];
//     }

//     return this.parseCachedListings(cachedListings);
//   }

//   list(params?: ListingListParams): Observable<Listing[]> {
//     const httpParams = this.buildListParams(params);

//     return this.http
//       .get<Listing[]>(`${API_BASE_URL}/listings/`, {
//         params: httpParams,
//       })
//       .pipe(tap((listings) => this.cachePublicListings(listings, params)));
//   }

//   detail(slug: string): Observable<Listing> {
//     return this.http.get<Listing>(`${API_BASE_URL}/listings/${slug}/`);
//   }

//   myListings(): Observable<Listing[]> {
//     return this.http.get<Listing[]>(`${API_BASE_URL}/listings/mine/`);
//   }

//   create(payload: ListingPayload): Observable<Listing> {
//     return this.http.post<Listing>(`${API_BASE_URL}/listings/create/`, payload);
//   }

//   uploadImage(
//     slug: string,
//     file: File,
//     altText = '',
//     sortOrder = 0,
//     isPrimary = false,
//   ): Observable<unknown> {
//     const formData = this.buildImageFormData(file, altText, sortOrder, isPrimary);
//     return this.http.post(`${API_BASE_URL}/listings/${slug}/images/create/`, formData);
//   }

//   updateImage(imageId: number, payload: ListingImagePayload): Observable<unknown> {
//     return this.http.patch(`${API_BASE_URL}/listings/images/${imageId}/update/`, payload);
//   }

//   deleteImage(imageId: number): Observable<void> {
//     return this.http.delete<void>(`${API_BASE_URL}/listings/images/${imageId}/delete/`);
//   }

//   update(slug: string, payload: ListingPayload): Observable<Listing> {
//     return this.http.patch<Listing>(`${API_BASE_URL}/listings/${slug}/update/`, payload);
//   }

//   delete(slug: string): Observable<void> {
//     return this.http.delete<void>(`${API_BASE_URL}/listings/${slug}/delete/`);
//   }

//   private buildListParams(params?: ListingListParams): HttpParams {
//     let httpParams = new HttpParams();

//     httpParams = this.appendParam(httpParams, 'category', params?.category);
//     httpParams = this.appendParam(httpParams, 'search', params?.search);
//     httpParams = this.appendParam(httpParams, 'min_price', params?.minPrice);
//     httpParams = this.appendParam(httpParams, 'max_price', params?.maxPrice);

//     return httpParams;
//   }

//   private appendParam(params: HttpParams, key: string, value?: string): HttpParams {
//     if (!value) {
//       return params;
//     }

//     return params.set(key, value);
//   }

//   private buildImageFormData(
//     file: File,
//     altText: string,
//     sortOrder: number,
//     isPrimary: boolean,
//   ): FormData {
//     const formData = new FormData();

//     formData.append('image', file);
//     formData.append('alt_text', altText);
//     formData.append('sort_order', String(sortOrder));
//     formData.append('is_primary', String(isPrimary));

//     return formData;
//   }

//   private cachePublicListings(listings: Listing[], params?: ListingListParams): void {
//     if (params) {
//       return;
//     }

//     localStorage.setItem(this.listCacheKey, JSON.stringify(listings));
//   }

//   private parseCachedListings(cachedListings: string): Listing[] {
//     try {
//       return JSON.parse(cachedListings) as Listing[];
//     } catch {
//       localStorage.removeItem(this.listCacheKey);
//       return [];
//     }
//   }
// }
