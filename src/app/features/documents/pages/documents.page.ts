import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DocumentsService } from '../../../core/services/documents.service';
import { DocumentItem } from '../../../core/models/document.model';

@Component({
  selector: 'app-documents-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
})
export class DocumentsPage {
  private readonly documentsService = inject(DocumentsService);

  readonly documents = signal<DocumentItem[]>([]);
  readonly isLoading = signal(true);

  constructor() {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.documentsService.list().subscribe({
      next: (documents) => {
        this.documents.set(documents);
        this.isLoading.set(false);
      },
      error: () => {
        this.documents.set([]);
        this.isLoading.set(false);
      },
    });
  }
}
