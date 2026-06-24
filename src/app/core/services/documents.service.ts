import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

  download(document: DocumentItem): Observable<void> {
    const url = `${API_BASE_URL}/documents/${document.id}/download/`;

    return this.http
      .get(url, { responseType: 'blob' })
      .pipe(map((file) => this.savePdf(file, document.document_number)));
  }

  private savePdf(file: Blob, documentNumber: string): void {
    const objectUrl = URL.createObjectURL(file);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = `${documentNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
}
