import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SeloryaLanguage = 'de' | 'en' | 'tr';

const LANGUAGE_STORAGE_KEY = 'selorya_language';
const FALLBACK_LANGUAGE: SeloryaLanguage = 'en';
const SUPPORTED_LANGUAGES: SeloryaLanguage[] = ['de', 'en', 'tr'];

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs([...SUPPORTED_LANGUAGES]);
    this.translate.setDefaultLang(FALLBACK_LANGUAGE);
    this.translate.use(this.resolveInitialLanguage());
  }

  t(key: string): string {
    return this.translate.instant(key);
  }

  use(lang: SeloryaLanguage): void {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    this.translate.use(lang);
  }

  current(): SeloryaLanguage {
    const currentLang = this.translate.currentLang;
    return this.isSupportedLanguage(currentLang) ? currentLang : FALLBACK_LANGUAGE;
  }

  languages(): SeloryaLanguage[] {
    return [...SUPPORTED_LANGUAGES];
  }

  private resolveInitialLanguage(): SeloryaLanguage {
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (this.isSupportedLanguage(savedLang)) {
      return savedLang;
    }

    return this.resolveBrowserLanguage();
  }

  private resolveBrowserLanguage(): SeloryaLanguage {
    const browserLang = this.translate.getBrowserLang();
    return this.isSupportedLanguage(browserLang) ? browserLang : FALLBACK_LANGUAGE;
  }

  private isSupportedLanguage(lang: unknown): lang is SeloryaLanguage {
    return SUPPORTED_LANGUAGES.includes(lang as SeloryaLanguage);
  }
}
