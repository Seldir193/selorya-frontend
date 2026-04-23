import { Injectable } from '@angular/core';
import { uiTexts } from '../i18n/ui-texts';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly lang: keyof typeof uiTexts = 'en';

  t(key: keyof (typeof uiTexts)['en']): string {
    return uiTexts[this.lang][key];
  }
}
