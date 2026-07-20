export type PayoutStatus = 'pending' | 'eligible' | 'paid' | 'failed' | 'cancelled';

export type PayoutItem = {
  id: number;
  order_id: number;
  seller: number;
  seller_email: string;
  status: PayoutStatus;
  amount: string;
  currency: string;
  external_reference: string;
  eligible_at: string | null;
  paid_at: string | null;
  failure_reason: string;
  created_at: string;
  updated_at: string;
};

export type MarkPayoutPaidPayload = {
  external_reference: string;
};
