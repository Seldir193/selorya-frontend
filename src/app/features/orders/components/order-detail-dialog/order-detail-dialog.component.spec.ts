import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Order, Shipment } from '../../../../core/models/order.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { OrderDetailDialogComponent } from './order-detail-dialog.component';

const shipment: Shipment = {
  id: 7,
  shipping_option: 3,
  scope: 'order',
  carrier: 'dhl',
  service_level: 'standard',
  service_name: 'DHL Standard',
  shipping_amount: '5.49',
  currency: 'EUR',
  recipient_name: 'Max Mustermann',
  address_line_1: 'Musterstraße 1',
  address_line_2: '',
  postal_code: '45127',
  city: 'Essen',
  country: 'Germany',
  tracking_number: 'DHL-123',
  label_reference: '',
  status: 'shipped',
  selected_at: '2026-07-17T10:00:00Z',
  shipped_at: '2026-07-17T12:00:00Z',
  delivered_at: null,
  payout_eligible_at: null,
  payout_blocked: true,
  payout_block_reason: 'delivery_not_confirmed',
  return_allowed: false,
  return_deadline: null,
  return_request: null,
  created_at: '2026-07-17T10:00:00Z',
  updated_at: '2026-07-17T12:00:00Z',
};

const order: Order = {
  id: 19,
  buyer: 4,
  buyer_email: 'buyer@example.com',
  buyer_name: 'Max Mustermann',
  status: 'paid',
  currency: 'EUR',
  subtotal: '40.00',
  total_amount: '47.59',
  payment_provider: 'paypal',
  payment_status: 'paid',
  shipment,
  items: [],
  created_at: '2026-07-17T10:00:00Z',
  updated_at: '2026-07-17T12:00:00Z',
};

describe('OrderDetailDialogComponent', () => {
  const i18nService = {
    t: vi.fn((key: string) => key),
    current: vi.fn(() => 'en'),
  };
  let fixture: ComponentFixture<OrderDetailDialogComponent>;
  let component: OrderDetailDialogComponent;

  function render(value: Order): string {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('order', value);
    fixture.detectChanges();
    return fixture.nativeElement.textContent;
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [OrderDetailDialogComponent],
      providers: [{ provide: I18nService, useValue: i18nService }],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderDetailDialogComponent);
    component = fixture.componentInstance;
  });

  it('shows shipping, tracking, and the authorized delivery address', () => {
    const text = render(order);
    expect(text).toContain('DHL Standard');
    expect(text).toContain('ordersShipmentStatusShipped');
    expect(text).toContain('DHL-123');
    expect(text).toContain('Max Mustermann');
    expect(text).toContain('Musterstraße 1');
  });

  it('does not render an address omitted by the backend', () => {
    const restricted = { ...shipment, recipient_name: undefined, address_line_1: undefined };
    const text = render({ ...order, shipment: restricted });
    expect(fixture.nativeElement.querySelector('address')).toBeNull();
    expect(text).not.toContain('Musterstraße 1');
  });

  it('shows a fallback when an old order has no shipment', () => {
    const text = render({ ...order, shipment: null });
    expect(text).toContain('ordersShipmentUnavailable');
  });

  it('maps compound shipment states to translations', () => {
    fixture.componentRef.setInput('order', {
      ...order,
      shipment: { ...shipment, status: 'issue_reported' },
    });
    expect(component.shipmentStatusLabel()).toBe('ordersShipmentStatusIssueReported');
  });
});
