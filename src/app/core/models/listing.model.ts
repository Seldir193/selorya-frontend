import { Category } from './category.model';

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

export type Listing = {
  id: number;
  seller: number;
  seller_name: string;
  seller_email: string;
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

// export type ListingUpdatePayload = ListingBasePayload & {
//   status?: ListingStatus;
// };
