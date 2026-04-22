import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Favorite } from '../models/favorite.model';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly http = inject(HttpClient);

  list(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${API_BASE_URL}/favorites/`);
  }

  create(listingId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`${API_BASE_URL}/favorites/create/`, {
      listing: listingId,
    });
  }

  delete(favoriteId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/favorites/${favoriteId}/delete/`);
  }
}
