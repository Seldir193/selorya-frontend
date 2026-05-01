import { Component, computed, inject } from '@angular/core';
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

  readonly isSeller = computed(() => {
    const role = this.authService.user()?.role;
    return role === 'seller' || role === 'admin';
  });

  constructor() {
    this.authService.initialize();
  }

  currentLanguage(): SeloryaLanguage {
    return this.i18nService.current();
  }

  changeLanguage(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.i18nService.use(select.value as SeloryaLanguage);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}

// import { Component, computed, inject } from '@angular/core';
// import { Router, RouterLink, RouterOutlet } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { AuthService } from '../../core/services/auth.service';

// @Component({
//   selector: 'app-shell',
//   standalone: true,
//   imports: [RouterLink, RouterOutlet, MatButtonModule],
//   templateUrl: './shell.component.html',
//   styleUrl: './shell.component.scss',
// })
// export class ShellComponent {
//   readonly authService = inject(AuthService);
//   private readonly router = inject(Router);

//   readonly isSeller = computed(() => {
//     const role = this.authService.user()?.role;
//     return role === 'seller' || role === 'admin';
//   });

//   constructor() {
//     this.authService.initialize();
//   }

//   logout(): void {
//     this.authService.logout();
//     this.router.navigateByUrl('/');
//   }
// }
