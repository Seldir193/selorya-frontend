import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,

  imports: [RouterLink, TranslatePipe],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  readonly authService = inject(AuthService);

  roleLabel(): string {
    const role = this.authService.user()?.role;

    if (role === 'admin') {
      return 'Administrator';
    }

    return 'Standardkonto';
  }

  languageLabel(): string {
    const language = this.authService.user()?.language;

    if (language === 'en') {
      return 'English';
    }

    if (language === 'tr') {
      return 'Türkçe';
    }

    return 'Deutsch';
  }
}
