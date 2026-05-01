import { Observable, of } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';
import { uiTexts, type UiLanguage } from './ui-texts';

export class UiTextLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<Record<string, string>> {
    const language = this.resolveLanguage(lang);
    return of(uiTexts[language]);
  }

  private resolveLanguage(lang: string): UiLanguage {
    return this.isUiLanguage(lang) ? lang : 'en';
  }

  private isUiLanguage(lang: string): lang is UiLanguage {
    return lang in uiTexts;
  }
}
