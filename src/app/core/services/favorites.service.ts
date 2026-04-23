import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Favorite } from '../models/favorite.model';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly favoritesState = new BehaviorSubject<Favorite[]>([]);

  readonly favorites$ = this.favoritesState.asObservable();

  list(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${API_BASE_URL}/favorites/`).pipe(
      tap((favorites) => {
        this.favoritesState.next(favorites);
      }),
    );
  }

  create(listingId: number): Observable<Favorite> {
    return this.http
      .post<Favorite>(`${API_BASE_URL}/favorites/create/`, {
        listing: listingId,
      })
      .pipe(
        tap((created) => {
          this.favoritesState.next([created, ...this.favoritesState.value]);
        }),
      );
  }

  delete(favoriteId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/favorites/${favoriteId}/delete/`).pipe(
      tap(() => {
        this.favoritesState.next(
          this.favoritesState.value.filter((item) => item.id !== favoriteId),
        );
      }),
    );
  }

  isFavorite(listingId: number): boolean {
    return this.favoritesState.value.some((item) => item.listing === listingId);
  }

  favoriteByListing(listingId: number): Favorite | undefined {
    return this.favoritesState.value.find((item) => item.listing === listingId);
  }

  clear(): void {
    this.favoritesState.next([]);
  }
}
