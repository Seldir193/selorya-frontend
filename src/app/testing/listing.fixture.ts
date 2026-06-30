import { Listing } from '../core/models/listing.model';

const defaultListing: Listing = {
  id: 11,
  seller: 4,
  seller_name: 'Selorya Seller',
  seller_email: 'seller@example.com',
  category: 2,
  category_data: {
    id: 2,
    name: 'Fashion',
    slug: 'fashion',
    description: 'Fashion category',
    is_active: true,
    sort_order: 1,
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  title: 'Vintage jacket',
  slug: 'vintage-jacket',
  description: 'A vintage jacket in good condition.',
  price: '40.00',
  condition: 'good',
  status: 'draft',
  city: 'Essen',
  country: 'Germany',
  is_featured: false,
  moderation_reason: '',
  submitted_at: null,
  reviewed_at: null,
  images: [],
  created_at: '2026-06-01T10:00:00Z',
  updated_at: '2026-06-01T10:00:00Z',
};

export const createListing = (overrides: Partial<Listing> = {}): Listing => ({
  ...defaultListing,
  ...overrides,
});
