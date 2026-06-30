import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize, switchMap } from 'rxjs';
import {
  CommercialStatus,
  SellerProfile,
  SellerProfileUpdatePayload,
  SellerType,
} from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ProfilesService } from '../../../core/services/profiles.service';
import { ToastService } from '../../../core/services/toast.service';

const REVIEW_REQUIRED_FIELDS = [
  'commercial_legal_name',
  'commercial_legal_form',
  'commercial_email',
  'commercial_address_line_1',
  'commercial_postal_code',
  'commercial_city',
  'commercial_country',
] as const;

const REVIEWABLE_STATUSES: CommercialStatus[] = ['not_requested', 'rejected'];

const STATUS_LABEL_KEYS: Record<CommercialStatus, string> = {
  not_requested: 'commercialStatusNotRequested',
  pending_review: 'commercialStatusPendingReview',
  approved: 'commercialStatusApproved',
  rejected: 'commercialStatusRejected',
  suspended: 'commercialStatusSuspended',
};

const STATUS_DESCRIPTION_KEYS: Record<CommercialStatus, string> = {
  not_requested: 'commercialStatusNotRequestedDescription',
  pending_review: 'commercialStatusPendingReviewDescription',
  approved: 'commercialStatusApprovedDescription',
  rejected: 'commercialStatusRejectedDescription',
  suspended: 'commercialStatusSuspendedDescription',
};

type ReviewField = (typeof REVIEW_REQUIRED_FIELDS)[number];

@Component({
  selector: 'app-commercial-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './commercial-profile.page.html',
  styleUrls: ['./commercial-profile.page.scss'],
})
export class CommercialProfilePage {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly profilesService = inject(ProfilesService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly isSaving = signal(false);
  readonly isRequestingReview = signal(false);

  readonly form = this.fb.nonNullable.group({
    // seller_type: this.fb.nonNullable.control<SellerType>(this.initialSellerType()),

    seller_type: this.fb.nonNullable.control<SellerType>({
      value: this.initialSellerType(),
      disabled: this.isPrivateSelectionLocked(),
    }),
    commercial_legal_name: [this.sellerText('commercial_legal_name')],
    commercial_legal_form: [this.sellerText('commercial_legal_form')],
    commercial_representative_name: [this.sellerText('commercial_representative_name')],
    commercial_email: [this.sellerText('commercial_email'), [Validators.email]],
    commercial_phone: [this.sellerText('commercial_phone')],
    commercial_address_line_1: [this.sellerText('commercial_address_line_1')],
    commercial_address_line_2: [this.sellerText('commercial_address_line_2')],
    commercial_postal_code: [this.sellerText('commercial_postal_code')],
    commercial_city: [this.sellerText('commercial_city')],
    commercial_country: [this.sellerText('commercial_country') || 'Germany'],
    commercial_register_court: [this.sellerText('commercial_register_court')],
    commercial_register_number: [this.sellerText('commercial_register_number')],
    commercial_vat_id: [this.sellerText('commercial_vat_id')],
  });

  commercialStatus(): CommercialStatus {
    return this.authService.user()?.seller_profile?.commercial_status ?? 'not_requested';
  }

  statusLabelKey(): string {
    return STATUS_LABEL_KEYS[this.commercialStatus()];
  }

  statusDescriptionKey(): string {
    return STATUS_DESCRIPTION_KEYS[this.commercialStatus()];
  }

  rejectionReason(): string {
    return this.authService.user()?.seller_profile?.commercial_rejection_reason ?? '';
  }

  isCommercial(): boolean {
    return this.form.controls.seller_type.value === 'commercial';
  }

  isBusy(): boolean {
    return this.isSaving() || this.isRequestingReview();
  }

  canRequestReview(): boolean {
    return (
      this.isCommercial() && REVIEWABLE_STATUSES.includes(this.commercialStatus()) && !this.isBusy()
    );
  }

  isPrivateSelectionLocked(): boolean {
    return this.commercialStatus() === 'approved';
  }

  showStatusResetHint(): boolean {
    const status = this.commercialStatus();

    return this.isCommercial() && (status === 'pending_review' || status === 'approved');
  }

  setSellerType(sellerType: SellerType): void {
    if (sellerType === 'private' && this.isPrivateSelectionLocked()) {
      return;
    }

    this.form.controls.seller_type.setValue(sellerType);
  }

  save(): void {
    if (this.isBusy()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.saveProfile()
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => this.toast.success(this.i18n.t('commercialProfileSaved')),
        error: () => this.toast.error(this.i18n.t('commercialProfileSaveFailed')),
      });
  }

  requestReview(): void {
    if (!this.canRequestReview()) {
      return;
    }

    if (!this.hasRequiredCommercialData()) {
      this.markReviewFieldsTouched();
      this.toast.error(this.i18n.t('commercialReviewRequiredFields'));
      return;
    }

    this.isRequestingReview.set(true);
    this.saveProfile()
      .pipe(
        switchMap(() => this.profilesService.requestCommercialReview()),
        switchMap(() => this.authService.loadMe()),
        finalize(() => this.isRequestingReview.set(false)),
      )
      .subscribe({
        next: () => this.toast.success(this.i18n.t('commercialReviewRequested')),
        error: () => this.toast.error(this.i18n.t('commercialReviewFailed')),
      });
  }

  isReviewFieldInvalid(field: ReviewField): boolean {
    const control = this.form.controls[field];

    return control.touched && !control.value.trim();
  }

  isEmailInvalid(): boolean {
    const control = this.form.controls.commercial_email;

    return control.touched && control.invalid;
  }

  private saveProfile() {
    return this.profilesService
      .updateSellerProfile(this.sellerPayload())
      .pipe(switchMap(() => this.authService.loadMe()));
  }

  private sellerPayload(): SellerProfileUpdatePayload {
    return this.form.getRawValue();
  }

  private hasRequiredCommercialData(): boolean {
    return (
      REVIEW_REQUIRED_FIELDS.every((field) => {
        return Boolean(this.form.controls[field].value.trim());
      }) && !this.form.controls.commercial_email.invalid
    );
  }

  private markReviewFieldsTouched(): void {
    REVIEW_REQUIRED_FIELDS.forEach((field) => {
      this.form.controls[field].markAsTouched();
    });
  }

  private initialSellerType(): SellerType {
    return this.authService.user()?.seller_profile?.seller_type ?? 'private';
  }

  private sellerText(field: keyof SellerProfile): string {
    const value = this.authService.user()?.seller_profile?.[field];

    return typeof value === 'string' ? value : '';
  }
}
