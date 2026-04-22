export type RegisterPayload = {
  email: string;
  full_name: string;
  role: 'customer' | 'seller';
  language: string;
  password: string;
};
