import { Component, inject, signal } from '@angular/core';

import { DatePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { DocumentsService } from '../../../core/services/documents.service';
import { DocumentItem } from '../../../core/models/document.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-documents-page',
  standalone: true,

  imports: [DatePipe, TranslatePipe],
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
})
export class DocumentsPage {
  private readonly documentsService = inject(DocumentsService);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly documents = signal<DocumentItem[]>([]);
  readonly isLoading = signal(true);
  readonly downloadIcon = 'assets/icons/documents/download.svg';
  readonly downloadingDocumentIds = signal<Set<number>>(new Set());

  readonly documentTypeKeys: Record<string, string> = {
    invoice: 'documentsTypeInvoice',
    credit_note: 'documentsTypeCreditNote',
    cancellation: 'documentsTypeCancellation',
    payment_reminder: 'documentsTypePaymentReminder',
    dunning_notice: 'documentsTypeDunningNotice',
    payout_statement: 'documentsTypePayoutStatement',
  };

  readonly documentStatusKeys: Record<string, string> = {
    draft: 'documentsStatusDraft',
    generated: 'documentsStatusGenerated',
    sent: 'documentsStatusSent',
  };

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

  downloadDocument(document: DocumentItem): void {
    if (!this.canDownload(document)) {
      return;
    }

    this.setDownloadState(document.id, true);
    this.documentsService
      .download(document)
      .pipe(finalize(() => this.setDownloadState(document.id, false)))
      .subscribe({ error: () => this.showDownloadError() });
  }

  isDownloading(documentId: number): boolean {
    return this.downloadingDocumentIds().has(documentId);
  }

  documentTypeKey(documentType: string): string {
    return this.documentTypeKeys[documentType] ?? documentType;
  }

  documentStatusKey(status: string): string {
    return this.documentStatusKeys[status] ?? status;
  }

  private canDownload(document: DocumentItem): boolean {
    return Boolean(document.file_url) && !this.isDownloading(document.id);
  }

  private setDownloadState(documentId: number, isDownloading: boolean): void {
    this.downloadingDocumentIds.update((documentIds) => {
      const nextDocumentIds = new Set(documentIds);

      if (isDownloading) {
        nextDocumentIds.add(documentId);
      } else {
        nextDocumentIds.delete(documentId);
      }

      return nextDocumentIds;
    });
  }

  private showDownloadError(): void {
    this.toastService.error(this.translate.instant('documentsDownloadFailed'));
  }
}
