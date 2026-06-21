import api from './api';
import {type Product,type CreateProductRequest,type UpdateProductRequest } from '../types/api.types';

export const getProductsByRestaurant = async (
  restaurantId: string
): Promise<Product[]> => {
  const response = await api.get(`/products/restaurant/${restaurantId}`);
  return response.data;
};

export const createProduct = async (
  dto: CreateProductRequest
): Promise<Product> => {
  const response = await api.post('/products', dto);
  return response.data;
};

export const updateProduct = async (
  id: string,
  dto: UpdateProductRequest
): Promise<Product> => {
  const response = await api.patch(`/products/${id}`, dto);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};