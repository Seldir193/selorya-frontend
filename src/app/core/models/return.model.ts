export type ShipmentReturnKind = 'withdrawal' | 'claim';
export type ShipmentReturnReason =
  | 'change_of_mind'
  | 'defective'
  | 'not_as_described'
  | 'wrong_item'
  | 'damaged'
  | 'counterfeit'
  | 'other';

export type ShipmentReturnStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'label_pending'
  | 'label_created'
  | 'return_shipped'
  | 'return_delivered'
  | 'refund_pending'
  | 'refunded'
  | 'cancelled';

export type ShipmentReturnShippingPayer = 'buyer' | 'seller' | 'platform' | 'undecided';

export type ShipmentReturn = {
  id: number;
  shipment: number;
  kind: ShipmentReturnKind;
  reason: ShipmentReturnReason;
  description: string;
  status: ShipmentReturnStatus;
  shipping_payer: ShipmentReturnShippingPayer;
  carrier: string;
  tracking_number: string;
  label_reference: string;
  carrier_status: string;
  carrier_status_description: string;
  carrier_event_at: string | null;
  carrier_accepted_at: string | null;
  requested_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  refunded_at: string | null;
  resolution_note: string;
  resolved_by: number | null;
  created_at: string;
  updated_at: string;
};

export type ShipmentReturnRequestPayload = {
  reason: 'change_of_mind';
  description: string;
};

export type ShipmentReturnShippingPayload = {
  carrier: string;
  tracking_number: string;
};
