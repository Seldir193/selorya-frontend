import { AuthUser, SellerProfile } from '../core/models/auth.model';

const defaultSellerProfile: SellerProfile = {
  id: 8,
  seller_type: 'private',
  display_name: 'Selorya Seller',
  bio: 'Reliable seller',
  city: 'Essen',
  country: 'Germany',
  commercial_status: 'not_requested',
  commercial_legal_name: '',
  commercial_legal_form: '',
  commercial_representative_name: '',
  commercial_email: '',
  commercial_phone: '',
  commercial_address_line_1: '',
  commercial_address_line_2: '',
  commercial_postal_code: '',
  commercial_city: '',
  commercial_country: '',
  commercial_register_court: '',
  commercial_register_number: '',
  commercial_vat_id: '',
  commercial_requested_at: null,
  commercial_reviewed_at: null,
  commercial_rejection_reason: '',
  created_at: '2026-06-01T10:00:00Z',
  updated_at: '2026-06-01T10:00:00Z',
};

const defaultUser: AuthUser = {
  id: 4,
  email: 'seller@example.com',
  full_name: 'Selorya Seller',
  avatar: null,
  avatar_url: null,
  role: 'seller',
  language: 'en',
  is_email_verified: true,
  created_at: '2026-06-01T10:00:00Z',
  updated_at: '2026-06-01T10:00:00Z',
  customer_profile: {
    id: 3,
    phone: '',
    city: 'Essen',
    country: 'Germany',
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  seller_profile: defaultSellerProfile,
};

export const createAuthUser = (sellerProfile: Partial<SellerProfile> = {}): AuthUser => ({
  ...defaultUser,
  seller_profile: { ...defaultSellerProfile, ...sellerProfile },
});
