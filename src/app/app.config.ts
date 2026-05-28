import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { UiTextLoader } from './core/i18n/ui-text.loader';
import { FontService } from './core/services/font.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideAnimationsAsync(),
    importProvidersFrom(MatSnackBarModule),
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateLoader(UiTextLoader),
    }),
    provideAppInitializer(() => {
      return inject(FontService).initialize();
    }),
  ],
};
