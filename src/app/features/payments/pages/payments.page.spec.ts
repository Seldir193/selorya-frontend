import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentItem } from '../../../core/models/payment.model';
import { I18nService } from '../../../core/services/i18n.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { PaymentsPage } from './payments.page';

const payment: PaymentItem = {
  id: 8,
  order: 23,
  order_id: 23,
  buyer_email: 'buyer@example.com',
  provider: 'stripe',
  status: 'paid',
  amount: '28.75',
  currency: 'EUR',
  external_reference: 'cs_test',
  paid_at: '2026-07-17T20:00:00Z',
  created_at: '2026-07-17T19:00:00Z',
  updated_at: '2026-07-17T20:00:00Z',
};

describe('PaymentsPage', () => {
  const paymentsService = { list: vi.fn(() => of([payment])) };
  const i18nService = { t: vi.fn((key: string) => key), current: vi.fn(() => 'de') };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [PaymentsPage],
      providers: [
        provideRouter([]),
        { provide: PaymentsService, useValue: paymentsService },
        { provide: I18nService, useValue: i18nService },
      ],
    });
  });

  it('renders the personal payment overview', () => {
    const fixture = TestBed.createComponent(PaymentsPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('#23');
    expect(fixture.nativeElement.textContent).toContain('28,75 €');
  });

  it('loads seller payments after changing the scope', () => {
    const fixture = TestBed.createComponent(PaymentsPage);
    fixture.componentInstance.changeScope('sold');
    expect(paymentsService.list).toHaveBeenLastCalledWith('sold');
  });
});
