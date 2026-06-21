import api from './api';
import {type Restaurant,type CreateRestaurantRequest } from '../types/api.types';

export const getMyRestaurant = async (): Promise<Restaurant | null> => {
  const response = await api.get('/restaurants/my');  // ← новый эндпоинт
  return response.data;
};

export const createRestaurant = async (
  dto: CreateRestaurantRequest
): Promise<Restaurant> => {
  const response = await api.post('/restaurants', dto);
  return response.data;
};

export const updateRestaurant = async (
  id: string,
  dto: Partial<CreateRestaurantRequest>
): Promise<Restaurant> => {
  const response = await api.patch(`/restaurants/${id}`, dto);
  return response.data;
};

export const deleteRestaurant = async (id: string): Promise<void> => {
  await api.delete(`/restaurants/${id}`);
};