import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { Order } from '../../../../core/models/order.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { ReturnSummaryComponent } from './return-summary.component';

const order = {
  id: 5,
  items: [{ seller_type_snapshot: 'commercial' }],
  shipment: {
    return_deadline: '2026-08-06T10:00:00Z',
    payout_eligible_at: '2026-08-06T10:00:00Z',
    return_request: {
      status: 'return_shipped',
      reason: 'defective',
      shipping_payer: 'seller',
      tracking_number: 'RET-44',
      resolution_note: 'Approved',
    },
  },
} as Order;

describe('ReturnSummaryComponent', () => {
  it('shows the seller snapshot and return lifecycle', () => {
    TestBed.configureTestingModule({
      imports: [ReturnSummaryComponent],
      providers: [
        {
          provide: I18nService,
          useValue: { t: vi.fn((key: string) => key), current: vi.fn(() => 'de') },
        },
      ],
    });
    const fixture = TestBed.createComponent(ReturnSummaryComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('returnSellerTypeCommercial');
    expect(text).toContain('returnStatusReturnShipped');
    expect(text).toContain('RET-44');
  });
});
