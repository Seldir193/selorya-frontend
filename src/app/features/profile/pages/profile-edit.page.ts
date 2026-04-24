import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';
import { ProfilesService } from '../../../core/services/profiles.service';
import { ToastService } from '../../../core/services/toast.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-profile-edit-page',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly profilesService = inject(ProfilesService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly isSubmitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    phone: [this.authService.user()?.customer_profile?.phone ?? ''],
    customerCity: [this.authService.user()?.customer_profile?.city ?? '', [Validators.required]],
    customerCountry: [
      this.authService.user()?.customer_profile?.country ?? 'Germany',
      [Validators.required],
    ],
    display_name: [
      this.authService.user()?.seller_profile?.display_name ?? '',
      [Validators.required],
    ],
    bio: [this.authService.user()?.seller_profile?.bio ?? ''],
    sellerCity: [this.authService.user()?.seller_profile?.city ?? '', [Validators.required]],
    sellerCountry: [
      this.authService.user()?.seller_profile?.country ?? 'Germany',
      [Validators.required],
    ],
  });

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.isSubmitting.set(true);

    this.profilesService
      .updateCustomerProfile({
        phone: value.phone,
        city: value.customerCity,
        country: value.customerCountry,
      })
      .subscribe({
        next: () => {
          this.profilesService
            .updateSellerProfile({
              display_name: value.display_name,
              bio: value.bio,
              city: value.sellerCity,
              country: value.sellerCountry,
            })
            .subscribe({
              next: () => {
                this.isSubmitting.set(false);
                this.toast.success(this.i18n.t('profileUpdated'));
                this.authService.initialize();
              },
              error: () => {
                this.isSubmitting.set(false);
                this.toast.error(this.i18n.t('profileUpdateFailed'));
              },
            });
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toast.error(this.i18n.t('profileUpdateFailed'));
        },
      });
  }
}
