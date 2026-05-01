import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { I18nService, SeloryaLanguage } from '../../core/services/i18n.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, TranslatePipe],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18nService = inject(I18nService);
  readonly isLanguageMenuOpen = signal(false);
  readonly isUserMenuOpen = signal(false);

  constructor() {
    this.authService.initialize();
  }

  currentLanguage(): SeloryaLanguage {
    return this.i18nService.current();
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update((isOpen) => !isOpen);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  userInitials(): string {
    const fullName = this.authService.user()?.full_name ?? '';
    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('');

    return initials || 'U';
  }
  logout(): void {
    this.closeUserMenu();
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
  closeMenusOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const languageDropdown = target.closest('[data-language-dropdown]');
    const userDropdown = target.closest('[data-user-dropdown]');

    if (!languageDropdown) {
      this.isLanguageMenuOpen.set(false);
    }

    if (!userDropdown) {
      this.isUserMenuOpen.set(false);
    }
  }
}
