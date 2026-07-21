import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PayoutItem } from '../../../core/models/payout.model';
import { I18nService } from '../../../core/services/i18n.service';
import { PayoutsService } from '../../../core/services/payouts.service';
import { AdminPayoutsPage } from './admin-payouts.page';

const eligiblePayout: PayoutItem = {
  id: 7,
  order_id: 43,
  seller: 9,
  seller_email: 'seller@example.com',
  status: 'eligible',
  amount: '10.00',
  currency: 'EUR',
  provider: '',
  external_reference: '',
  eligible_at: '2026-07-20T16:00:00Z',
  processing_at: null,
  paid_at: null,
  attempt_count: 0,
  failure_reason: '',
  created_at: '2026-07-20T15:00:00Z',
  updated_at: '2026-07-20T16:00:00Z',
};

describe('AdminPayoutsPage', () => {
  const paidPayout = { ...eligiblePayout, status: 'paid' as const, external_reference: 'BANK-43' };
  const failedPayout = { ...eligiblePayout, status: 'failed' as const, failure_reason: 'down' };
  const payoutsService = {
    list: vi.fn(() => of([eligiblePayout])),
    markPaid: vi.fn(() => of(paidPayout)),
    retry: vi.fn(() => of(paidPayout)),
  };
  const i18nService = { t: vi.fn((key: string) => key), current: vi.fn(() => 'de') };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [AdminPayoutsPage],
      providers: [
        { provide: PayoutsService, useValue: payoutsService },
        { provide: I18nService, useValue: i18nService },
      ],
    });
  });

  it('renders eligible payouts with the admin action', () => {
    const fixture = TestBed.createComponent(AdminPayoutsPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('#43');
    expect(fixture.nativeElement.textContent).toContain('adminPayoutsMarkPaid');
  });

  it('submits the external payout reference', () => {
    const fixture = TestBed.createComponent(AdminPayoutsPage);
    const page = fixture.componentInstance;
    page.openMarkPaid(eligiblePayout);
    page.referenceForm.setValue({ external_reference: 'BANK-43' });
    page.submitMarkPaid();
    expect(payoutsService.markPaid).toHaveBeenCalledWith(7, { external_reference: 'BANK-43' });
    expect(page.payouts()[0].status).toBe('paid');
  });

  it('retries a failed automatic payout', () => {
    const fixture = TestBed.createComponent(AdminPayoutsPage);
    const page = fixture.componentInstance;
    page.payouts.set([failedPayout]);
    page.retryAutomatic(failedPayout);
    expect(payoutsService.retry).toHaveBeenCalledWith(7);
    expect(page.payouts()[0].status).toBe('paid');
  });
});
