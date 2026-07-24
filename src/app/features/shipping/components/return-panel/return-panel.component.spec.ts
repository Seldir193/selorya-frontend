import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Order, SellerType } from '../../../../core/models/order.model';
import { ShipmentReturnStatus } from '../../../../core/models/return.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { ReturnsService } from '../../../../core/services/returns.service';
import { ReturnPanelComponent } from './return-panel.component';

function orderFixture(
  sellerType: SellerType = 'commercial',
  returnStatus: ShipmentReturnStatus | null = null,
): Order {
  const returnRequest = returnStatus
    ? {
        id: 7,
        shipment: 4,
        reason: 'defective' as const,
        description: 'Defect',
        status: returnStatus,
        shipping_payer: 'seller' as const,
        carrier: '',
        tracking_number: '',
        label_reference: '',
        requested_at: '2026-07-24T10:00:00Z',
        approved_at: null,
        rejected_at: null,
        shipped_at: null,
        delivered_at: null,
        refunded_at: null,
        resolution_note: '',
        resolved_by: null,
        created_at: '2026-07-24T10:00:00Z',
        updated_at: '2026-07-24T10:00:00Z',
      }
    : null;
  return {
    id: 5,
    buyer: 2,
    buyer_email: 'buyer@example.com',
    buyer_name: 'Buyer',
    status: 'paid',
    currency: 'EUR',
    subtotal: '20.00',
    total_amount: '24.00',
    payment_provider: 'stripe',
    payment_status: 'paid',
    payment_id: 3,
    items: [
      {
        id: 1,
        listing: 9,
        seller: 8,
        seller_type_snapshot: sellerType,
        title_snapshot: 'Jacket',
        price_snapshot: '20.00',
        quantity: 1,
        line_total: '20.00',
        created_at: '2026-07-20T10:00:00Z',
        updated_at: '2026-07-20T10:00:00Z',
      },
    ],
    shipment: {
      id: 4,
      shipping_option: 1,
      scope: 'order',
      carrier: 'dhl',
      service_level: 'standard',
      service_name: 'DHL Paket',
      shipping_amount: '4.00',
      currency: 'EUR',
      tracking_number: 'DHL-1',
      label_reference: '',
      status: 'delivered',
      selected_at: '2026-07-20T10:00:00Z',
      shipped_at: '2026-07-21T10:00:00Z',
      delivered_at: '2026-07-23T10:00:00Z',
      payout_eligible_at: '2026-08-06T10:00:00Z',
      payout_blocked: Boolean(returnRequest),
      payout_block_reason: returnRequest ? 'return_open' : 'payout_window_open',
      return_allowed: !returnRequest,
      return_deadline: '2026-08-06T10:00:00Z',
      return_request: returnRequest,
      created_at: '2026-07-20T10:00:00Z',
      updated_at: '2026-07-23T10:00:00Z',
    },
    created_at: '2026-07-20T10:00:00Z',
    updated_at: '2026-07-23T10:00:00Z',
  };
}

describe('ReturnPanelComponent', () => {
  const returnsService = {
    requestReturn: vi.fn(() => of({})),
    shipReturn: vi.fn(() => of({})),
    confirmReturnDelivery: vi.fn(() => of({})),
  };
  const i18nService = {
    t: vi.fn((key: string) => key),
    current: vi.fn(() => 'de'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [ReturnPanelComponent],
      providers: [
        { provide: ReturnsService, useValue: returnsService },
        { provide: I18nService, useValue: i18nService },
      ],
    });
  });

  function create(order: Order, scope: 'purchased' | 'sold' | 'all') {
    const fixture = TestBed.createComponent(ReturnPanelComponent);
    fixture.componentRef.setInput('order', order);
    fixture.componentRef.setInput('scope', scope);
    fixture.detectChanges();
    return fixture;
  }

  it('offers change of mind only for commercial sellers', () => {
    const commercial = create(orderFixture('commercial'), 'purchased');
    commercial.componentInstance.openRequest();
    commercial.detectChanges();
    expect(commercial.nativeElement.textContent).toContain('returnReasonChangeOfMind');
    commercial.destroy();

    const privateFixture = create(orderFixture('private'), 'purchased');
    privateFixture.componentInstance.openRequest();
    privateFixture.detectChanges();
    expect(privateFixture.nativeElement.textContent).not.toContain('returnReasonChangeOfMind');
  });

  it('sends the selected reason and description', () => {
    const fixture = create(orderFixture(), 'purchased');
    fixture.componentInstance.openRequest();
    fixture.componentInstance.reason.set('defective');
    fixture.componentInstance.description.set('Broken zipper');
    fixture.componentInstance.requestReturn();
    expect(returnsService.requestReturn).toHaveBeenCalledWith(4, {
      reason: 'defective',
      description: 'Broken zipper',
    });
  });

  it('allows return shipping only after approval', () => {
    const requested = create(orderFixture('commercial', 'requested'), 'purchased');
    expect(requested.componentInstance.canShip()).toBe(false);
    requested.destroy();

    const approved = create(orderFixture('commercial', 'approved'), 'purchased');
    expect(approved.componentInstance.canShip()).toBe(true);
  });

  it('allows the seller to confirm a shipped return', () => {
    const fixture = create(orderFixture('commercial', 'return_shipped'), 'sold');
    fixture.componentInstance.confirmDelivery();
    expect(returnsService.confirmReturnDelivery).toHaveBeenCalledWith(7);
  });

  it('keeps the form available after an API error', () => {
    returnsService.requestReturn.mockReturnValueOnce(
      throwError(() => new Error('request failed')),
    );
    const fixture = create(orderFixture(), 'purchased');
    fixture.componentInstance.openRequest();
    fixture.componentInstance.requestReturn();
    expect(fixture.componentInstance.failedAction()).toBe('request');
    expect(fixture.componentInstance.requestOpen()).toBe(true);
  });
});
