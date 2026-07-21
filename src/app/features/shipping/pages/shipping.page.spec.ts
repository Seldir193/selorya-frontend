import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Order } from '../../../core/models/order.model';
import { I18nService } from '../../../core/services/i18n.service';
import { OrdersService } from '../../../core/services/orders.service';
import { ShippingPage } from './shipping.page';

const order: Order = {
  id: 23,
  buyer: 4,
  buyer_email: 'buyer@example.com',
  buyer_name: 'Buyer',
  status: 'paid',
  currency: 'EUR',
  subtotal: '22.00',
  total_amount: '28.75',
  payment_provider: 'stripe',
  payment_status: 'paid',
  items: [],
  shipment: {
    id: 5,
    shipping_option: 2,
    scope: 'order',
    carrier: 'dhl',
    service_level: 'standard',
    service_name: 'DHL Standardversand',
    shipping_amount: '4.95',
    currency: 'EUR',
    tracking_number: '',
    label_reference: '',
    status: 'selected',
    selected_at: '2026-07-17T20:00:00Z',
    shipped_at: null,
    auto_complete_at: null,
    delivered_at: null,
    issue_category: '',
    issue_description: '',
    issue_reported_at: null,
    created_at: '2026-07-17T20:00:00Z',
    updated_at: '2026-07-17T20:00:00Z',
  },
  created_at: '2026-07-17T20:00:00Z',
  updated_at: '2026-07-17T20:00:00Z',
};

describe('ShippingPage', () => {
  const shipped = { ...order.shipment!, status: 'shipped' as const, tracking_number: 'DHL-42' };
  const ordersService = {
    list: vi.fn(() => of([order])),
    dispatchShipment: vi.fn(() => of(shipped)),
    confirmDelivery: vi.fn(() => of({ ...order, status: 'completed', shipment: shipped })),
    reportShipmentIssue: vi.fn(() =>
      of({ ...order, shipment: { ...shipped, status: 'issue_reported' as const } }),
    ),
  };
  const i18nService = { t: vi.fn((key: string) => key), current: vi.fn(() => 'de') };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [ShippingPage],
      providers: [
        { provide: OrdersService, useValue: ordersService },
        { provide: I18nService, useValue: i18nService },
      ],
    });
  });

  it('renders the personal shipment overview', () => {
    const fixture = TestBed.createComponent(ShippingPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('DHL Standardversand');
    expect(fixture.nativeElement.textContent).toContain('4,95 €');
  });

  it('loads sold orders after changing the scope', () => {
    const fixture = TestBed.createComponent(ShippingPage);
    fixture.componentInstance.changeScope('sold');
    expect(ordersService.list).toHaveBeenLastCalledWith('sold');
  });

  it('lets the seller dispatch a paid order with tracking', () => {
    const fixture = TestBed.createComponent(ShippingPage);
    const component = fixture.componentInstance;
    component.changeScope('sold');
    component.updateTracking(5, ' DHL-42 ');
    component.dispatch(order as Order & { shipment: NonNullable<Order['shipment']> });
    expect(ordersService.dispatchShipment).toHaveBeenCalledWith(5, {
      status: 'shipped',
      tracking_number: 'DHL-42',
    });
    expect(component.orders()[0].shipment?.status).toBe('shipped');
  });

  it('requires tracking before dispatch', () => {
    const component = TestBed.createComponent(ShippingPage).componentInstance;
    component.changeScope('sold');
    component.dispatch(order as Order & { shipment: NonNullable<Order['shipment']> });
    expect(component.dispatchErrorId()).toBe(5);
    expect(ordersService.dispatchShipment).not.toHaveBeenCalled();
  });

  it('lets the buyer confirm a shipped delivery', () => {
    const shippedOrder = { ...order, shipment: shipped };
    ordersService.list.mockReturnValueOnce(of([shippedOrder]));
    const component = TestBed.createComponent(ShippingPage).componentInstance;
    component.confirmDelivery(shippedOrder);
    expect(ordersService.confirmDelivery).toHaveBeenCalledWith(5);
    expect(component.orders()[0].status).toBe('completed');
  });

  it('lets the buyer report an issue for a shipped delivery', () => {
    const shippedOrder = { ...order, shipment: shipped };
    ordersService.list.mockReturnValueOnce(of([shippedOrder]));
    const component = TestBed.createComponent(ShippingPage).componentInstance;
    component.openIssueForm(shippedOrder);
    component.issueCategory.set('damaged');
    component.issueDescription.set('Package damaged');
    component.reportIssue(shippedOrder);
    expect(ordersService.reportShipmentIssue).toHaveBeenCalledWith(5, {
      category: 'damaged',
      description: 'Package damaged',
    });
    expect(component.orders()[0].shipment?.status).toBe('issue_reported');
  });

  it('shows the automatic completion deadline to the buyer', () => {
    const deadlineShipment = { ...shipped, auto_complete_at: '2026-07-31T12:00:00Z' };
    ordersService.list.mockReturnValueOnce(of([{ ...order, shipment: deadlineShipment }]));
    const fixture = TestBed.createComponent(ShippingPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('shippingAutoCompleteNotice');
    expect(fixture.nativeElement.textContent).toContain('31.07.2026');
  });

  it('prevents a second issue report after a reviewed issue', () => {
    const component = TestBed.createComponent(ShippingPage).componentInstance;
    const reviewed = { ...order, shipment: { ...shipped, issue_category: 'other' as const } };
    expect(component.canReportIssue(reviewed)).toBe(false);
  });

  it('keeps space input inside the issue form', () => {
    ordersService.list.mockReturnValueOnce(of([{ ...order, shipment: shipped }]));
    const fixture = TestBed.createComponent(ShippingPage);
    fixture.detectChanges();
    fixture.componentInstance.openIssueForm({ ...order, shipment: shipped });
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(fixture.componentInstance.selectedOrder()).toBeNull();
  });
});
