export type PaymentProvider = 'stripe' | 'paypal' | 'manual';
export type OrderScope = 'purchased' | 'sold' | 'all';

export type OrderItem = {
  id: number;
  listing: number;
  seller: number;
  title_snapshot: string;
  price_snapshot: string;
  quantity: number;
  line_total: string;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: number;
  buyer: number;
  buyer_email: string;
  buyer_name: string;
  status: string;
  currency: string;
  subtotal: string;
  total_amount: string;
  payment_provider: PaymentProvider | null;
  payment_status: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};

export type StripeCheckoutResponse = {
  provider: 'stripe';
  payment_id: number;
  checkout_url: string;
  session_id: string;
};

export type PayPalCheckoutResponse = {
  provider: 'paypal';
  payment_id: number;
  paypal_order_id: string;
  approve_url: string;
};
