import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommercialStatus, SellerType } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';

const COMMERCIAL_STATUS_KEYS: Record<CommercialStatus, string> = {
  not_requested: 'commercialStatusNotRequested',
  pending_review: 'commercialStatusPendingReview',
  approved: 'commercialStatusApproved',
  rejected: 'commercialStatusRejected',
  suspended: 'commercialStatusSuspended',
};

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
    return this.authService.user()?.role === 'admin' ? 'Administrator' : 'Standardkonto';
  }

  languageLabel(): string {
    const language = this.authService.user()?.language;

    if (language === 'en') {
      return 'English';
    }

    return language === 'tr' ? 'Türkçe' : 'Deutsch';
  }

  sellerType(): SellerType {
    return this.authService.user()?.seller_profile?.seller_type ?? 'private';
  }

  isCommercialSeller(): boolean {
    return this.sellerType() === 'commercial';
  }

  sellerTypeLabelKey(): string {
    return this.isCommercialSeller()
      ? 'commercialSellerTypeCommercial'
      : 'commercialSellerTypePrivate';
  }

  commercialStatusLabelKey(): string {
    const status = this.authService.user()?.seller_profile?.commercial_status;

    return COMMERCIAL_STATUS_KEYS[status ?? 'not_requested'];
  }
}

// import { Component, inject } from '@angular/core';
// import { AuthService } from '../../../core/services/auth.service';
// import { TranslatePipe } from '@ngx-translate/core';
// import { RouterLink } from '@angular/router';

// @Component({
//   selector: 'app-profile-page',
//   standalone: true,

//   imports: [RouterLink, TranslatePipe],
//   templateUrl: './profile.page.html',
//   styleUrls: ['./profile.page.scss'],
// })
// export class ProfilePage {
//   readonly authService = inject(AuthService);

//   roleLabel(): string {
//     const role = this.authService.user()?.role;

//     if (role === 'admin') {
//       return 'Administrator';
//     }

//     return 'Standardkonto';
//   }

//   languageLabel(): string {
//     const language = this.authService.user()?.language;

//     if (language === 'en') {
//       return 'English';
//     }

//     if (language === 'tr') {
//       return 'Türkçe';
//     }

//     return 'Deutsch';
//   }
// }
