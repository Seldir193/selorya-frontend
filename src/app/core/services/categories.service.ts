import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly http = inject(HttpClient);

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/categories/`);
  }
}
