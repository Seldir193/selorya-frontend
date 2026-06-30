import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ProfilesService } from '../../../core/services/profiles.service';
import { ToastService } from '../../../core/services/toast.service';
import { createAuthUser } from '../../../testing/auth-user.fixture';
import { CommercialProfilePage } from './commercial-profile.page';

const commercialProfile = {
  seller_type: 'commercial' as const,
  commercial_legal_name: 'Selorya GmbH',
  commercial_legal_form: 'GmbH',
  commercial_email: 'office@selorya.example',
  commercial_address_line_1: 'Market Street 1',
  commercial_postal_code: '45127',
  commercial_city: 'Essen',
  commercial_country: 'Germany',
};

describe('CommercialProfilePage', () => {
  const user = createAuthUser(commercialProfile);

  const authService = {
    user: signal(user),
    loadMe: vi.fn(() => of(user)),
  };

  const profilesService = {
    updateSellerProfile: vi.fn(() => of(user.seller_profile)),
    requestCommercialReview: vi.fn(() => of(user.seller_profile)),
  };

  const toastService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const i18nService = {
    t: vi.fn((key: string) => key),
  };

  let component: CommercialProfilePage;

  beforeEach(async () => {
    vi.clearAllMocks();
    authService.user.set(user);

    await TestBed.configureTestingModule({
      imports: [CommercialProfilePage],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ProfilesService, useValue: profilesService },
        { provide: ToastService, useValue: toastService },
        { provide: I18nService, useValue: i18nService },
      ],
    })
      .overrideComponent(CommercialProfilePage, {
        set: { template: '' },
      })
      .compileComponents();

    component = TestBed.createComponent(CommercialProfilePage).componentInstance;
  });

  it('saves commercial data before requesting review', () => {
    component.requestReview();

    expect(profilesService.updateSellerProfile).toHaveBeenCalledOnce();
    expect(profilesService.requestCommercialReview).toHaveBeenCalledOnce();
    expect(authService.loadMe).toHaveBeenCalledTimes(2);
    expect(toastService.success).toHaveBeenCalledWith('commercialReviewRequested');
  });

  it('blocks a review request when required business data is missing', () => {
    component.form.controls.commercial_legal_name.setValue('');
    component.requestReview();

    expect(profilesService.requestCommercialReview).not.toHaveBeenCalled();
    expect(toastService.error).toHaveBeenCalledWith('commercialReviewRequiredFields');
  });
});
