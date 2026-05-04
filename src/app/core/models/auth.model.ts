export type UserRole = 'guest' | 'customer' | 'seller' | 'admin';

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
  display_name: string;
  bio: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
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
