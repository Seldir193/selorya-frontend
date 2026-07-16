import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly errorText = signal('');
  readonly isSubmitting = signal(false);
  readonly isPasswordVisible = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    full_name: ['', [Validators.required]],

    password: ['', [Validators.required, Validators.minLength(8)]],
    acceptsTerms: [false, [Validators.requiredTrue]],
    acceptsPrivacy: [false, [Validators.requiredTrue]],
  });

  togglePasswordVisibility(): void {
    this.isPasswordVisible.update((isVisible) => !isVisible);
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const payload = {
      email: formValue.email,
      full_name: formValue.full_name,
      password: formValue.password,
      language: this.i18n.current(),
    };

    this.errorText.set('');
    this.isSubmitting.set(true);

    this.authService.register(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl('/login');
        this.toast.success(this.i18n.t('registerSuccess'));
      },
      error: () => {
        this.isSubmitting.set(false);
        const message = this.i18n.t('registerFailed');
        this.errorText.set(message);
        this.toast.error(message);
      },
    });
  }
}
