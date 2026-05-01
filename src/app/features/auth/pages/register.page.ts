import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    // MatButtonModule,
    // MatCardModule,
    // MatFormFieldModule,
    // MatInputModule,
    // MatSelectModule,
  ],
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

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    full_name: ['', [Validators.required]],

    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorText.set('');
    this.isSubmitting.set(true);

    const payload = {
      ...this.form.getRawValue(),
      language: this.i18n.current(),
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl('/login');
        this.toast.success(this.i18n.t('registerSuccess'));
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorText.set('Registration failed.');

        const message = this.i18n.t('registerFailed');
        this.errorText.set(message);
        this.toast.error(message);
      },
    });
  }
}
