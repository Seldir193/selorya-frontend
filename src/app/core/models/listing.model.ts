import { Category } from './category.model';
import { SellerType } from './auth.model';

export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'blocked'
  | 'rejected'
  | 'sold'
  | 'archived';

export type ListingSubmissionStatus = 'draft' | 'pending_review';

export type ListingImage = {
  id: number;
  image: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type CommercialSellerPublic = {
  legal_name: string;
  legal_form: string;
  representative_name: string;
  email: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  postal_code: string;
  city: string;
  country: string;
  register_court: string;
  register_number: string;
  vat_id: string;
};

export type Listing = {
  id: number;
  seller: number;
  seller_name: string;
  seller_email: string;
  seller_type: SellerType | null;
  commercial_seller: CommercialSellerPublic | null;
  category: number;
  category_data: Category;
  title: string;
  slug: string;
  description: string;
  price: string;
  condition: string;
  status: ListingStatus;
  city: string;
  country: string;
  is_featured: boolean;
  moderation_reason: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  images: ListingImage[];
  created_at: string;
  updated_at: string;
};

export type ListingBasePayload = {
  category: number;
  title: string;
  slug: string;
  description: string;
  price: string;
  condition: string;
  city: string;
  country: string;
  is_featured: boolean;
};

export type ListingCreatePayload = ListingBasePayload & {
  status: ListingSubmissionStatus;
};

export type ListingUpdatePayload = ListingBasePayload & {
  status?: ListingSubmissionStatus;
};
