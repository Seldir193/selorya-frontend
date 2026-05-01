import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { I18nService, SeloryaLanguage } from '../../core/services/i18n.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatButtonModule, TranslatePipe],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18nService = inject(I18nService);
  readonly isLanguageMenuOpen = signal(false);

  constructor() {
    this.authService.initialize();
  }

  currentLanguage(): SeloryaLanguage {
    return this.i18nService.current();
  }

  // changeLanguage(event: Event): void {
  //   const select = event.target as HTMLSelectElement;
  //   this.i18nService.use(select.value as SeloryaLanguage);
  // }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen.update((isOpen) => !isOpen);
  }

  selectLanguage(lang: SeloryaLanguage): void {
    this.i18nService.use(lang);
    this.isLanguageMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  closeLanguageMenuOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('[data-language-dropdown]');

    if (!dropdown) {
      this.isLanguageMenuOpen.set(false);
    }
  }
}
