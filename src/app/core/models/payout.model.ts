export type PayoutStatus =
  | 'pending'
  | 'eligible'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled';

export type PayoutItem = {
  id: number;
  order_id: number;
  seller: number;
  seller_email: string;
  status: PayoutStatus;
  amount: string;
  currency: string;
  provider: string;
  external_reference: string;
  eligible_at: string | null;
  processing_at: string | null;
  paid_at: string | null;
  attempt_count: number;
  failure_reason: string;
  created_at: string;
  updated_at: string;
};

export type MarkPayoutPaidPayload = {
  external_reference: string;
};

export type PayoutOnboardingStatus = {
  provider: 'stripe';
  connected: boolean;
  details_submitted: boolean;
  payouts_enabled: boolean;
  ready: boolean;
};

export type PayoutOnboardingLink = {
  url: string;
};

export type PayoutProviderAccount = {
  provider: 'stripe' | 'paypal';
  connected: boolean;
  ready: boolean;
  destination: string;
};

export type PayPalPayoutAccountPayload = {
  email: string;
};
