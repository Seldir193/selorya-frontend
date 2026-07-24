import { ShipmentReturn } from './return.model';

export type PaymentProvider = 'stripe' | 'paypal' | 'manual';
export type CheckoutProvider = 'stripe' | 'paypal';
export type OrderScope = 'purchased' | 'sold' | 'all';
export type SellerType = 'private' | 'commercial';
export type ShipmentPayoutBlockReason =
  | ''
  | 'shipment_missing'
  | 'delivery_not_confirmed'
  | 'return_open'
  | 'shipment_issue'
  | 'payout_window_open';
export type ShipmentStatus =
  | 'selection_required'
  | 'selected'
  | 'label_created'
  | 'shipped'
  | 'delivered'
  | 'issue_reported'
  | 'cancelled'
  | 'legacy_unknown';

export type ShippingOption = {
  id: number;
  code: string;
  carrier: string;
  service_level: string;
  name: string;
  amount: string;
  currency: string;
};

export type ShippingSelectionPayload = {
  shipping_option_id: number;
  recipient_name: string;
  address_line_1: string;
  address_line_2: string;
  postal_code: string;
  city: string;
  country: string;
};

export type ShipmentDispatchPayload = {
  status: 'shipped';
  tracking_number: string;
};

export type ShipmentIssueCategory =
  'not_received' | 'damaged' | 'not_as_described' | 'wrong_item' | 'other';

export type ShipmentIssuePayload = {
  category: ShipmentIssueCategory;
  description: string;
};

export type ShipmentIssueResolutionStatus = 'resolved' | 'rejected';

export type ShipmentIssueResolutionPayload = {
  status: ShipmentIssueResolutionStatus;
  note: string;
};

export type OrderCreatePayload = {
  listing_id: number;
  quantity: number;
  shipping: ShippingSelectionPayload;
};

export type Shipment = Partial<Omit<ShippingSelectionPayload, 'shipping_option_id'>> & {
  id: number;
  shipping_option: number | null;
  scope: 'order';
  carrier: string;
  service_level: string;
  service_name: string;
  shipping_amount: string;
  currency: string;
  tracking_number: string;
  label_reference: string;
  status: ShipmentStatus;
  selected_at: string | null;
  shipped_at: string | null;
  carrier_status?: string;
  carrier_status_description?: string;
  carrier_checked_at?: string | null;
  carrier_event_at?: string | null;
  carrier_delivered_at?: string | null;
  auto_complete_at?: string | null;
  delivered_at: string | null;
  payout_eligible_at: string | null;
  payout_blocked: boolean;
  payout_block_reason: ShipmentPayoutBlockReason;
  return_allowed: boolean;
  return_deadline: string | null;
  return_request: ShipmentReturn | null;
  issue_category?: ShipmentIssueCategory | '';
  issue_description?: string;
  issue_reported_at?: string | null;
  issue_status?: 'open' | ShipmentIssueResolutionStatus | '';
  issue_resolution_note?: string;
  issue_resolved_at?: string | null;
  issue_resolved_by?: number | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  listing: number;
  seller: number;
  seller_type_snapshot: SellerType;
  commercial_seller_snapshot?: Record<string, unknown> | null;
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
  payment_id?: number | null;
  shipment: Shipment | null;
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

export type CheckoutResponse = StripeCheckoutResponse | PayPalCheckoutResponse;
