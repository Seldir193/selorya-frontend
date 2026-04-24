import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatButtonModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSeller = computed(() => {
    const role = this.authService.user()?.role;
    return role === 'seller' || role === 'admin';
  });

  constructor() {
    this.authService.initialize();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}
