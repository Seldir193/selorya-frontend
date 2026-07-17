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
    delivered_at: null,
    created_at: '2026-07-17T20:00:00Z',
    updated_at: '2026-07-17T20:00:00Z',
  },
  created_at: '2026-07-17T20:00:00Z',
  updated_at: '2026-07-17T20:00:00Z',
};

describe('ShippingPage', () => {
  const ordersService = { list: vi.fn(() => of([order])) };
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
});
