export type FavoriteListingData = {
  id: number;
  slug: string;
  title: string;
  price: string;
  status: string;
  city: string;
  country: string;
  seller_name: string;
  category_name: string;
  primary_image_url: string;
  primary_image_alt: string;
};

export type Favorite = {
  id: number;
  listing: number;
  listing_data: FavoriteListingData;
  created_at: string;
  updated_at: string;
};

// export type FavoriteListingData = {
//   id: number;
//   slug: string;
//   title: string;
//   price: string;
//   status: string;
//   city: string;
//   country: string;
//   seller_name: string;
//   category_name: string;
// };

// export type Favorite = {
//   id: number;
//   listing: number;
//   listing_data: FavoriteListingData;
//   created_at: string;
//   updated_at: string;
// };
