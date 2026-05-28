import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FontService {
  async initialize(): Promise<void> {
    if (!('fonts' in document)) {
      return;
    }

    await document.fonts.load('700 14px "Selorya Sans"');
    await document.fonts.ready;
  }
}
