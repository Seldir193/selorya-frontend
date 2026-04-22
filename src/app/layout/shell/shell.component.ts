import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
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

  logout(): void {
    this.authService.logout();
  }
}
