import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommercialSellerReview } from '../../../core/models/auth.model';
import { I18nService } from '../../../core/services/i18n.service';
import { ProfilesService } from '../../../core/services/profiles.service';
import { ToastService } from '../../../core/services/toast.service';
import { createAuthUser } from '../../../testing/auth-user.fixture';
import { AdminCommercialSellersPage } from './admin-commercial-sellers.page';

const pendingSeller = createCommercialSeller();

describe('AdminCommercialSellersPage', () => {
  const profilesService = {
    listCommercialSellers: vi.fn(() => of([pendingSeller])),
    approveCommercialSeller: vi.fn(() => {
      return of({
        ...pendingSeller,
        commercial_status: 'approved' as const,
      });
    }),
    rejectCommercialSeller: vi.fn(() => {
      return of({
        ...pendingSeller,
        commercial_status: 'rejected' as const,
      });
    }),
    suspendCommercialSeller: vi.fn(() => {
      return of({
        ...pendingSeller,
        commercial_status: 'suspended' as const,
      });
    }),
  };

  const toastService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const i18nService = {
    current: vi.fn(() => 'en'),
    t: vi.fn((key: string) => key),
  };

  let component: AdminCommercialSellersPage;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [AdminCommercialSellersPage],
      providers: [
        { provide: ProfilesService, useValue: profilesService },
        { provide: ToastService, useValue: toastService },
        { provide: I18nService, useValue: i18nService },
      ],
    })
      .overrideComponent(AdminCommercialSellersPage, {
        set: { template: '' },
      })
      .compileComponents();

    component = TestBed.createComponent(AdminCommercialSellersPage).componentInstance;
  });

  it('loads pending commercial seller reviews by default', () => {
    expect(profilesService.listCommercialSellers).toHaveBeenCalledWith({
      status: 'pending_review',
      search: '',
    });

    expect(component.sellers()).toEqual([pendingSeller]);
  });

  it('changes the moderation list when the status filter changes', () => {
    component.changeStatus('approved');

    expect(profilesService.listCommercialSellers).toHaveBeenLastCalledWith({
      status: 'approved',
      search: '',
    });
  });

  it('approves a pending seller and closes the dialog', () => {
    component.openDecisionDialog(pendingSeller, 'approve');
    component.confirmDecision();

    expect(profilesService.approveCommercialSeller).toHaveBeenCalledWith(pendingSeller.id);

    expect(component.isDecisionDialogOpen()).toBe(false);
    expect(toastService.success).toHaveBeenCalledWith('adminCommercialApproveSuccess');
  });

  it('requires a reason before rejecting a seller', () => {
    component.openDecisionDialog(pendingSeller, 'reject');
    component.confirmDecision();

    expect(profilesService.rejectCommercialSeller).not.toHaveBeenCalled();

    component.decisionForm.controls.reason.setValue('Business address is incomplete.');

    component.confirmDecision();

    expect(profilesService.rejectCommercialSeller).toHaveBeenCalledWith(
      pendingSeller.id,
      'Business address is incomplete.',
    );

    expect(component.isDecisionDialogOpen()).toBe(false);
    expect(toastService.success).toHaveBeenCalledWith('adminCommercialRejectSuccess');
  });
});

function createCommercialSeller(): CommercialSellerReview {
  const sellerProfile = createAuthUser({
    seller_type: 'commercial',
    commercial_status: 'pending_review',
    commercial_legal_name: 'Selorya GmbH',
    commercial_legal_form: 'GmbH',
    commercial_representative_name: 'Selcuk Kocyigit',
    commercial_email: 'office@selorya.example',
    commercial_phone: '+49 201 123456',
    commercial_address_line_1: 'Marktstraße 1',
    commercial_postal_code: '45127',
    commercial_city: 'Essen',
    commercial_country: 'Germany',
    commercial_requested_at: '2026-06-30T10:00:00Z',
  }).seller_profile;

  return {
    ...sellerProfile,
    user_email: 'seller@example.com',
    user_full_name: 'Selorya Seller',
    commercial_reviewer_email: null,
  };
}
