export type UserRole = 'USER' | 'RESTAURANT' | 'COURIER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
   description: string | null; 
  price: number;
  image: string | null;  
  restaurantId: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateRestaurantRequest {
  name: string;
  image: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  image?: string;
  restaurantId: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface OrderUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  reference: string;
  status: string;
  total: number;
  deliveryAddress: string | null;
  comment: string | null;
  createdAt: string;
  user: OrderUser | null;
  items: OrderItem[];
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED';