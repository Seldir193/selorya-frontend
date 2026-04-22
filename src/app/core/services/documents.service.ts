import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { DocumentItem } from '../models/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly http = inject(HttpClient);

  list(): Observable<DocumentItem[]> {
    return this.http.get<DocumentItem[]>(`${API_BASE_URL}/documents/`);
  }
}
