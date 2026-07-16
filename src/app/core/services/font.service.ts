import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FontService {
  async initialize(): Promise<void> {
    if (!('fonts' in document)) {
      return;
    }

    await Promise.all([
      document.fonts.load('400 14px "Selorya Sans"'),
      document.fonts.load('600 14px "Selorya Sans"'),
      document.fonts.load('700 14px "Selorya Sans"'),
    ]);

    await document.fonts.ready;
  }
}
