// import { Component, HostListener, inject, signal } from '@angular/core';
import { Component, HostListener, ViewChild, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { I18nService, SeloryaLanguage } from '../../core/services/i18n.service';
import {
  DropdownComponent,
  DropdownOption,
} from '../../shared/components/dropdown/dropdown.component';
import { GlobalSearchComponent } from '../../shared/components/global-search/global-search.component';
import { FooterComponent } from '../footer/footer.component';
import { CategoryMenuComponent } from '../category-menu/category-menu.component';
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    TranslatePipe,
    DropdownComponent,
    GlobalSearchComponent,
    FooterComponent,
    CategoryMenuComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18nService = inject(I18nService);

  readonly isUserMenuOpen = signal(false);
  readonly currentUrl = signal(this.router.url);
  @ViewChild(CategoryMenuComponent)
  private readonly categoryMenu?: CategoryMenuComponent;

  readonly isCategoryMenuOpen = signal(false);

  readonly languageOptions: DropdownOption<SeloryaLanguage>[] = [
    { value: 'de', label: 'Deutsch', triggerLabel: 'DE' },
    { value: 'en', label: 'English', triggerLabel: 'EN' },
    { value: 'tr', label: 'Türkçe', triggerLabel: 'TR' },
  ];

  constructor() {
    this.authService.initialize();
    this.watchRouteChanges();
  }

  setCategoryMenuOpen(isOpen: boolean): void {
    this.isCategoryMenuOpen.set(isOpen);
  }

  closeCategoryMenu(): void {
    this.categoryMenu?.closeMenu();
    this.isCategoryMenuOpen.set(false);
  }

  currentLanguage(): SeloryaLanguage {
    return this.i18nService.current();
  }

  selectLanguage(lang: SeloryaLanguage): void {
    this.i18nService.use(lang);
  }

  showGlobalSearch(): boolean {
    const path = this.currentUrl().split('?')[0];
    return path === '/' || path === '/listings' || path.startsWith('/categories');
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

  @HostListener('document:click', ['$event'])
  closeMenusOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const userDropdown = target.closest('[data-user-dropdown]');

    if (!userDropdown) {
      this.isUserMenuOpen.set(false);
    }
  }

  private watchRouteChanges(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.currentUrl.set(this.router.url));
  }
}
