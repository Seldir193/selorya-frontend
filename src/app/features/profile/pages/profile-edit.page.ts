import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize, Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ProfilesService } from '../../../core/services/profiles.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profile-edit-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly profilesService = inject(ProfilesService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly isSubmitting = signal(false);
  readonly selectedAvatar = signal<File | null>(null);
  readonly avatarPreviewUrl = signal<string | null>(null);
  readonly shouldRemoveAvatar = signal(false);

  readonly visibleAvatarUrl = computed(() => {
    if (this.shouldRemoveAvatar()) {
      return null;
    }

    return this.avatarPreviewUrl() || this.authService.user()?.avatar_url || null;
  });

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
    if (this.isSubmitting()) {
      return;
    }

    if (this.form.invalid && !this.selectedAvatar()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.saveProfileChanges()
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => this.handleSaveSuccess(),
        error: () => this.toast.error(this.i18n.t('profileUpdateFailed')),
      });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!this.isValidAvatar(file)) {
      input.value = '';
      return;
    }

    this.setAvatarPreview(file);
  }

  ngOnDestroy(): void {
    this.clearAvatarPreview();
  }
  private saveProfileChanges(): Observable<unknown> {
    const value = this.form.getRawValue();

    return this.updateAvatarIfNeeded().pipe(
      switchMap(() => this.updateCustomerProfile(value)),
      switchMap(() => this.updateSellerProfile(value)),
    );
  }

  private updateAvatarIfNeeded(): Observable<unknown> {
    const avatar = this.selectedAvatar();

    if (avatar) {
      return this.authService.uploadAvatar(avatar);
    }

    if (this.shouldRemoveAvatar()) {
      return this.authService.removeAvatar();
    }

    return of(null);
  }

  private updateCustomerProfile(
    value: ReturnType<typeof this.form.getRawValue>,
  ): Observable<unknown> {
    return this.profilesService.updateCustomerProfile({
      phone: value.phone,
      city: value.customerCity,
      country: value.customerCountry,
    });
  }

  removeAvatar(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.selectedAvatar.set(null);
    this.clearAvatarPreview();
    this.shouldRemoveAvatar.set(true);
    this.isSubmitting.set(true);

    this.authService
      .removeAvatar()
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => this.handleAvatarRemoveSuccess(),
        error: () => this.handleAvatarRemoveError(),
      });
  }

  private handleAvatarRemoveSuccess(): void {
    this.shouldRemoveAvatar.set(false);
    this.toast.success(this.i18n.t('profileAvatarRemoved'));
    this.authService.loadMe().subscribe();
  }

  private handleAvatarRemoveError(): void {
    this.shouldRemoveAvatar.set(false);
    this.toast.error(this.i18n.t('profileUpdateFailed'));
  }

  private updateSellerProfile(
    value: ReturnType<typeof this.form.getRawValue>,
  ): Observable<unknown> {
    return this.profilesService.updateSellerProfile({
      display_name: value.display_name,
      bio: value.bio,
      city: value.sellerCity,
      country: value.sellerCountry,
    });
  }

  private setAvatarPreview(file: File): void {
    this.clearAvatarPreview();
    this.shouldRemoveAvatar.set(false);
    this.selectedAvatar.set(file);
    this.avatarPreviewUrl.set(URL.createObjectURL(file));
  }

  private clearAvatarPreview(): void {
    const previewUrl = this.avatarPreviewUrl();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    this.avatarPreviewUrl.set(null);
  }

  private isValidAvatar(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      this.toast.error(this.i18n.t('profileAvatarInvalid'));
      return false;
    }

    return this.isValidAvatarSize(file);
  }

  private isValidAvatarSize(file: File): boolean {
    if (file.size <= 3 * 1024 * 1024) {
      return true;
    }

    this.toast.error(this.i18n.t('profileAvatarTooLarge'));
    return false;
  }

  private handleSaveSuccess(): void {
    this.selectedAvatar.set(null);
    this.shouldRemoveAvatar.set(false);
    this.clearAvatarPreview();
    this.toast.success(this.i18n.t('profileUpdated'));
    this.authService.loadMe().subscribe();
  }
}

// import { Component, computed,inject, signal } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { finalize, Observable, of, switchMap } from 'rxjs';
// import { AuthService } from '../../../core/services/auth.service';
// import { ProfilesService } from '../../../core/services/profiles.service';
// import { ToastService } from '../../../core/services/toast.service';
// import { I18nService } from '../../../core/services/i18n.service';
// import { TranslatePipe } from '@ngx-translate/core';

// @Component({
//   selector: 'app-profile-edit-page',
//   standalone: true,
//   imports: [ReactiveFormsModule, TranslatePipe],
//   templateUrl: './profile-edit.page.html',
//   styleUrls: ['./profile-edit.page.scss'],
// })
// export class ProfileEditPage {
//   private readonly fb = inject(FormBuilder);

//   readonly authService = inject(AuthService);
//   private readonly profilesService = inject(ProfilesService);
//   private readonly toast = inject(ToastService);
//   private readonly i18n = inject(I18nService);

//   readonly isSubmitting = signal(false);

//   readonly selectedAvatar = signal<File | null>(null);
// readonly avatarPreviewUrl = signal<string | null>(null);

// readonly visibleAvatarUrl = computed(() => {
//   return this.avatarPreviewUrl() || this.authService.user()?.avatar_url || null;
// });

//   readonly form = this.fb.nonNullable.group({
//     phone: [this.authService.user()?.customer_profile?.phone ?? ''],
//     customerCity: [this.authService.user()?.customer_profile?.city ?? '', [Validators.required]],
//     customerCountry: [
//       this.authService.user()?.customer_profile?.country ?? 'Germany',
//       [Validators.required],
//     ],
//     display_name: [
//       this.authService.user()?.seller_profile?.display_name ?? '',
//       [Validators.required],
//     ],
//     bio: [this.authService.user()?.seller_profile?.bio ?? ''],
//     sellerCity: [this.authService.user()?.seller_profile?.city ?? '', [Validators.required]],
//     sellerCountry: [
//       this.authService.user()?.seller_profile?.country ?? 'Germany',
//       [Validators.required],
//     ],
//   });

//   submit(): void {
//     if (this.form.invalid || this.isSubmitting()) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     const value = this.form.getRawValue();
//     this.isSubmitting.set(true);

//     this.profilesService
//       .updateCustomerProfile({
//         phone: value.phone,
//         city: value.customerCity,
//         country: value.customerCountry,
//       })
//       .subscribe({
//         next: () => {
//           this.profilesService
//             .updateSellerProfile({
//               display_name: value.display_name,
//               bio: value.bio,
//               city: value.sellerCity,
//               country: value.sellerCountry,
//             })
//             .subscribe({
//               next: () => {
//                 this.isSubmitting.set(false);
//                 this.toast.success(this.i18n.t('profileUpdated'));
//                 this.authService.initialize();
//               },
//               error: () => {
//                 this.isSubmitting.set(false);
//                 this.toast.error(this.i18n.t('profileUpdateFailed'));
//               },
//             });
//         },
//         error: () => {
//           this.isSubmitting.set(false);
//           this.toast.error(this.i18n.t('profileUpdateFailed'));
//         },
//       });
//   }
// }
