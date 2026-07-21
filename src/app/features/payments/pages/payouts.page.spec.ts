import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentItem } from '../../../core/models/document.model';
import { PayoutItem } from '../../../core/models/payout.model';
import { DocumentsService } from '../../../core/services/documents.service';
import { I18nService } from '../../../core/services/i18n.service';
import { PayoutsService } from '../../../core/services/payouts.service';
import { PayoutsPage } from './payouts.page';

const payout: PayoutItem = {
  id: 4,
  order_id: 43,
  seller: 9,
  seller_email: 'seller@example.com',
  status: 'paid',
  amount: '10.00',
  currency: 'EUR',
  provider: 'stripe',
  external_reference: 'BANK-43',
  eligible_at: '2026-07-20T16:00:00Z',
  processing_at: '2026-07-20T16:30:00Z',
  paid_at: '2026-07-20T17:00:00Z',
  attempt_count: 1,
  failure_reason: '',
  created_at: '2026-07-20T15:00:00Z',
  updated_at: '2026-07-20T17:00:00Z',
};

const statement = {
  id: 12,
  order_id: 43,
  document_type: 'payout_statement',
  document_number: 'PAY-2026-0001',
} as DocumentItem;

describe('PayoutsPage', () => {
  const payoutsService = {
    list: vi.fn(() => of([payout])),
    onboardingStatus: vi.fn(() =>
      of({
        provider: 'stripe',
        connected: true,
        details_submitted: true,
        payouts_enabled: true,
        ready: true,
      }),
    ),
    createOnboardingLink: vi.fn(() => of({ url: 'https://stripe.test' })),
  };
  const documentsService = { list: vi.fn(() => of([statement])), download: vi.fn(() => of()) };
  const i18nService = { t: vi.fn((key: string) => key), current: vi.fn(() => 'de') };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [PayoutsPage],
      providers: [
        provideRouter([]),
        { provide: PayoutsService, useValue: payoutsService },
        { provide: DocumentsService, useValue: documentsService },
        { provide: I18nService, useValue: i18nService },
      ],
    });
  });

  it('renders seller payouts and their statement action', () => {
    const fixture = TestBed.createComponent(PayoutsPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('#43');
    expect(fixture.nativeElement.textContent).toContain('10,00 €');
    expect(fixture.nativeElement.textContent).toContain('payoutsDownloadStatement');
  });

  it('downloads the matching payout statement', () => {
    const fixture = TestBed.createComponent(PayoutsPage);
    fixture.componentInstance.downloadStatement(payout);
    expect(documentsService.download).toHaveBeenCalledWith(statement);
  });

  it('shows the verified Stripe payout account', () => {
    const fixture = TestBed.createComponent(PayoutsPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('payoutsOnboardingReadyTitle');
  });
});
