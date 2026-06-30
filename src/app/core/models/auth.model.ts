export type UserRole = 'guest' | 'customer' | 'seller' | 'admin';

export type SellerType = 'private' | 'commercial';

export type CommercialStatus =
  | 'not_requested'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type CustomerProfile = {
  id: number;
  phone: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
};

export type SellerProfile = {
  id: number;
  seller_type: SellerType;
  display_name: string;
  bio: string;
  city: string;
  country: string;
  commercial_status: CommercialStatus;
  commercial_legal_name: string;
  commercial_legal_form: string;
  commercial_representative_name: string;
  commercial_email: string;
  commercial_phone: string;
  commercial_address_line_1: string;
  commercial_address_line_2: string;
  commercial_postal_code: string;
  commercial_city: string;
  commercial_country: string;
  commercial_register_court: string;
  commercial_register_number: string;
  commercial_vat_id: string;
  commercial_requested_at: string | null;
  commercial_reviewed_at: string | null;
  commercial_rejection_reason: string;
  created_at: string;
  updated_at: string;
};

export type SellerProfileUpdatePayload = {
  seller_type?: SellerType;
  display_name?: string;
  bio?: string;
  city?: string;
  country?: string;
  commercial_legal_name?: string;
  commercial_legal_form?: string;
  commercial_representative_name?: string;
  commercial_email?: string;
  commercial_phone?: string;
  commercial_address_line_1?: string;
  commercial_address_line_2?: string;
  commercial_postal_code?: string;
  commercial_city?: string;
  commercial_country?: string;
  commercial_register_court?: string;
  commercial_register_number?: string;
  commercial_vat_id?: string;
};

export type CommercialSellerReview = SellerProfile & {
  user_email: string;
  user_full_name: string;
  commercial_reviewer_email: string | null;
};

export type AuthUser = {
  id: number;
  email: string;
  full_name: string;
  avatar: string | null;
  avatar_url: string | null;
  role: UserRole;
  language: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  customer_profile: CustomerProfile;
  seller_profile: SellerProfile;
};

export type JwtLoginResponse = {
  refresh: string;
  access: string;
  user: AuthUser;
};

export type JwtRefreshResponse = {
  access: string;
};

// export type UserRole = 'guest' | 'customer' | 'seller' | 'admin';

// export type CustomerProfile = {
//   id: number;
//   phone: string;
//   city: string;
//   country: string;
//   created_at: string;
//   updated_at: string;
// };

// export type SellerProfile = {
//   id: number;
//   display_name: string;
//   bio: string;
//   city: string;
//   country: string;
//   created_at: string;
//   updated_at: string;
// };

// export type AuthUser = {
//   id: number;
//   email: string;
//   full_name: string;
//   avatar: string | null;
//   avatar_url: string | null;
//   role: UserRole;
//   language: string;
//   is_email_verified: boolean;
//   created_at: string;
//   updated_at: string;
//   customer_profile: CustomerProfile;
//   seller_profile: SellerProfile;
// };

// export type JwtLoginResponse = {
//   refresh: string;
//   access: string;
//   user: AuthUser;
// };

// export type JwtRefreshResponse = {
//   access: string;
// };
