import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly cacheKey = 'selorya_categories';

  getCachedCategories(): Category[] {
    const cachedCategories = localStorage.getItem(this.cacheKey);

    if (!cachedCategories) {
      return [];
    }

    return this.parseCachedCategories(cachedCategories);
  }

  list(): Observable<Category[]> {
    return this.http
      .get<Category[]>(`${API_BASE_URL}/categories/`)
      .pipe(tap((categories) => this.cacheCategories(categories)));
  }

  private cacheCategories(categories: Category[]): void {
    localStorage.setItem(this.cacheKey, JSON.stringify(categories));
  }

  private parseCachedCategories(cachedCategories: string): Category[] {
    try {
      return JSON.parse(cachedCategories) as Category[];
    } catch {
      localStorage.removeItem(this.cacheKey);
      return [];
    }
  }
}
