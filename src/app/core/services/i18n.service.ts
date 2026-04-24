import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly translate = inject(TranslateService);

  constructor() {
    const browserLang = this.translate.getBrowserLang();
    const lang = browserLang === 'de' || browserLang === 'tr' ? browserLang : 'en';

    this.translate.setDefaultLang('en');
    this.translate.use(lang);
  }

  t(key: string): string {
    return this.translate.instant(key);
  }

  use(lang: 'de' | 'en' | 'tr'): void {
    this.translate.use(lang);
  }

  current(): string {
    return this.translate.currentLang || 'en';
  }
}
