import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Order } from '../../../../core/models/order.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { OrdersService } from '../../../../core/services/orders.service';
import { ReturnsService } from '../../../../core/services/returns.service';
import { AdminReturnResolutionComponent } from './admin-return-resolution.component';

function orderFixture(status = 'requested'): Order {
  return {
    id: 5,
    payment_id: 3,
    payment_status: 'paid',
    items: [{ seller_type_snapshot: 'commercial', title_snapshot: 'Jacket' }],
    shipment: {
      id: 4,
      return_deadline: '2026-08-06T10:00:00Z',
      payout_block_reason: 'return_open',
      return_request: {
        id: 7,
        reason: 'defective',
        description: 'Broken zipper',
        status,
        shipping_payer: 'seller',
        requested_at: '2026-07-24T10:00:00Z',
      },
    },
  } as Order;
}

describe('AdminReturnResolutionComponent', () => {
  const returnsService = {
    resolveReturn: vi.fn(() => of({})),
    confirmReturnDelivery: vi.fn(() => of({})),
  };
  const ordersService = { refundPayment: vi.fn(() => of({})) };
  const i18nService = {
    t: vi.fn((key: string) => key),
    current: vi.fn(() => 'de'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [AdminReturnResolutionComponent],
      providers: [
        { provide: ReturnsService, useValue: returnsService },
        { provide: OrdersService, useValue: ordersService },
        { provide: I18nService, useValue: i18nService },
      ],
    });
  });

  function create(order: Order) {
    const fixture = TestBed.createComponent(AdminReturnResolutionComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();
    return fixture;
  }

  it('submits an approval with optional overrides', () => {
    const fixture = create(orderFixture());
    fixture.componentInstance.openDecision('approved');
    fixture.componentInstance.decisionForm.setValue({
      note: 'Approved',
      shipping_payer: 'platform',
      carrier: 'dhl',
      label_reference: 'RET-4',
    });
    fixture.componentInstance.submitDecision();
    expect(returnsService.resolveReturn).toHaveBeenCalledWith(7, {
      decision: 'approved',
      note: 'Approved',
      shipping_payer: 'platform',
      carrier: 'dhl',
      label_reference: 'RET-4',
    });
  });

  it('does not send empty optional fields on rejection', () => {
    const fixture = create(orderFixture());
    fixture.componentInstance.openDecision('rejected');
    fixture.componentInstance.decisionForm.patchValue({ note: 'Insufficient evidence' });
    fixture.componentInstance.submitDecision();
    expect(returnsService.resolveReturn).toHaveBeenCalledWith(7, {
      decision: 'rejected',
      note: 'Insufficient evidence',
    });
  });

  it('requires a decision note', () => {
    const fixture = create(orderFixture());
    fixture.componentInstance.openDecision('approved');
    fixture.componentInstance.submitDecision();
    expect(returnsService.resolveReturn).not.toHaveBeenCalled();
    expect(fixture.componentInstance.decisionForm.controls.note.touched).toBe(true);
  });

  it('enables refunds only after returned delivery', () => {
    const shipped = create(orderFixture('return_shipped'));
    expect(shipped.componentInstance.canRefund()).toBe(false);
    shipped.destroy();

    const delivered = create(orderFixture('return_delivered'));
    expect(delivered.componentInstance.canRefund()).toBe(true);
    delivered.componentInstance.confirmRefund();
    expect(ordersService.refundPayment).toHaveBeenCalledWith(3);
  });

  it('confirms returned delivery from return shipped', () => {
    const fixture = create(orderFixture('return_shipped'));
    fixture.componentInstance.confirmDelivery();
    expect(returnsService.confirmReturnDelivery).toHaveBeenCalledWith(7);
  });
});
