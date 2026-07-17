import { PaymentProvider } from './order.model';

export type PaymentScope = 'purchased' | 'sold' | 'all';

export type PaymentStatus =
  'pending' | 'authorized' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';

export type PaymentItem = {
  id: number;
  order: number;
  order_id: number;
  buyer_email: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: string;
  currency: string;
  external_reference: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};
