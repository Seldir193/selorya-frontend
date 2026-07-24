import {
  OrderScope,
  ShipmentIssueCategory,
  ShipmentStatus,
} from '../../../core/models/order.model';

export type ShipmentStatusFilter = 'all' | ShipmentStatus;

export const ORDER_SCOPES: OrderScope[] = ['purchased', 'sold', 'all'];
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const SHIPMENT_STATUS_FILTERS: ShipmentStatusFilter[] = [
  'all',
  'selection_required',
  'selected',
  'label_created',
  'shipped',
  'delivered',
  'issue_reported',
  'cancelled',
  'legacy_unknown',
];
export const SHIPMENT_ISSUE_CATEGORIES: ShipmentIssueCategory[] = [
  'not_received',
  'damaged',
  'not_as_described',
  'wrong_item',
  'other',
];
