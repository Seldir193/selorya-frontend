import { Category } from './category.model';

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
  status: string;
  city: string;
  country: string;
  is_featured: boolean;
  images: ListingImage[];
  created_at: string;
  updated_at: string;
};
