export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  currency?: string;
  inStock?: boolean;
  thumbnail: string;
}

export interface User {
  id: number;
  user_name: string;
  user_email: string;
  user_password: string;
}
