import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Order } from '../../../core/models/order.model';
import { I18nService } from '../../../core/services/i18n.service';
import { OrdersService } from '../../../core/services/orders.service';
import { AdminShipmentIssuesPage } from './admin-shipment-issues.page';

const order = {
  id: 34,
  buyer_name: 'Buyer',
  buyer_email: 'buyer@example.com',
  items: [{ title_snapshot: 'Item' }],
  shipment: {
    id: 27,
    issue_status: 'open',
    issue_category: 'damaged',
    issue_description: 'Damaged parcel',
    issue_reported_at: '2026-07-18T12:00:00Z',
  },
  updated_at: '2026-07-18T12:00:00Z',
} as Order;

describe('AdminShipmentIssuesPage', () => {
  const ordersService = {
    listShipmentIssues: vi.fn(() => of([order])),
    resolveShipmentIssue: vi.fn(() =>
      of({ ...order, shipment: { ...order.shipment!, issue_status: 'resolved' as const } }),
    ),
    refundPayment: vi.fn(() => of({})),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [AdminShipmentIssuesPage],
      providers: [
        { provide: OrdersService, useValue: ordersService },
        { provide: I18nService, useValue: { t: (key: string) => key, current: () => 'de' } },
      ],
    });
  });

  it('loads reported shipment issues', () => {
    const component = TestBed.createComponent(AdminShipmentIssuesPage).componentInstance;
    expect(component.orders()).toEqual([order]);
  });

  it('submits an admin resolution with a required note', () => {
    const component = TestBed.createComponent(AdminShipmentIssuesPage).componentInstance;
    component.openResolution(order, 'resolved');
    component.resolutionForm.setValue({ note: 'Reviewed case.' });
    component.submitResolution();
    expect(ordersService.resolveShipmentIssue).toHaveBeenCalledWith(27, {
      status: 'resolved',
      note: 'Reviewed case.',
    });
  });

  it('requests a confirmed provider refund', () => {
    const component = TestBed.createComponent(AdminShipmentIssuesPage).componentInstance;
    component.openRefund({ ...order, payment_id: 9 });
    component.confirmRefund();
    expect(ordersService.refundPayment).toHaveBeenCalledWith(9);
  });
});
