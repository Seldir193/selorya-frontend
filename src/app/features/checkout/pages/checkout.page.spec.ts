import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderCreatePayload, ShippingOption } from '../../../core/models/order.model';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ListingsService } from '../../../core/services/listings.service';
import { OrdersService } from '../../../core/services/orders.service';
import { ToastService } from '../../../core/services/toast.service';
import { createAuthUser } from '../../../testing/auth-user.fixture';
import { createListing } from '../../../testing/listing.fixture';
import { CheckoutPage } from './checkout.page';

const shippingOption: ShippingOption = {
  id: 3,
  code: 'dhl-standard',
  carrier: 'dhl',
  service_level: 'standard',
  name: 'DHL Standard',
  amount: '5.49',
  currency: 'EUR',
};

const address = {
  recipient_name: 'Selorya Buyer',
  address_line_1: 'Marktstraße 1',
  address_line_2: '',
  postal_code: '45127',
  city: 'Essen',
  country: 'Germany',
};

describe('CheckoutPage', () => {
  const user = signal(createAuthUser());
  const listing = createListing({ status: 'published' });
  const listingsService = { detail: vi.fn(() => of(listing)) };
  const ordersService = {
    shippingOptions: vi.fn(() => of([shippingOption])),
    create: vi.fn(() => of({ id: 44 })),
    selectShipping: vi.fn(() => of({ id: 9 })),
    startCheckout: vi.fn(() => NEVER),
  };
  const toastService = { error: vi.fn() };
  const i18nService = {
    t: vi.fn((key: string) => key),
    current: vi.fn(() => 'en'),
  };
  const providers = [
    { provide: ActivatedRoute, useValue: checkoutRoute() },
    { provide: AuthService, useValue: { user } },
    { provide: ListingsService, useValue: listingsService },
    { provide: OrdersService, useValue: ordersService },
    { provide: ToastService, useValue: toastService },
    { provide: I18nService, useValue: i18nService },
  ];
  let component: CheckoutPage;

  function fillAddress(): void {
    component.form.patchValue(address);
  }

  function expectedPayload(): OrderCreatePayload {
    return {
      listing_id: listing.id,
      quantity: 1,
      shipping: { shipping_option_id: shippingOption.id, ...address },
    };
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    ordersService.startCheckout.mockReturnValue(NEVER);
    await TestBed.configureTestingModule({
      imports: [CheckoutPage],
      providers,
    })
      .overrideComponent(CheckoutPage, { set: { template: '' } })
      .compileComponents();
    component = TestBed.createComponent(CheckoutPage).componentInstance;
  });

  it('loads the listing and selects the first shipping option', () => {
    expect(listingsService.detail).toHaveBeenCalledWith('vintage-jacket');
    expect(ordersService.shippingOptions).toHaveBeenCalledOnce();
    expect(component.listing()).toEqual(listing);
    expect(component.form.controls.shipping_option_id.value).toBe(shippingOption.id);
    expect(component.form.controls.city.value).toBe('Essen');
  });

  it('creates an order with shipping before starting Stripe', () => {
    fillAddress();
    component.submit();
    expect(ordersService.create).toHaveBeenCalledWith(expectedPayload());
    expect(ordersService.startCheckout).toHaveBeenCalledWith('stripe', 44);
    expect(component.createdOrderId()).toBe(44);
  });

  it('reuses the pending order after a payment start failure', () => {
    const failure = throwError(() => new Error('payment unavailable'));
    ordersService.startCheckout.mockReturnValueOnce(failure).mockReturnValue(NEVER);
    fillAddress();
    component.submit();
    component.submit();
    expect(ordersService.create).toHaveBeenCalledOnce();
    expect(ordersService.selectShipping).toHaveBeenCalledWith(44, expectedPayload().shipping);
    expect(ordersService.startCheckout).toHaveBeenCalledTimes(2);
  });

  it('does not create an order with an incomplete address', () => {
    component.submit();
    expect(component.form.invalid).toBe(true);
    expect(ordersService.create).not.toHaveBeenCalled();
  });
});

function checkoutRoute() {
  return {
    snapshot: {
      paramMap: { get: (key: string) => (key === 'provider' ? 'stripe' : 'vintage-jacket') },
    },
  };
}
