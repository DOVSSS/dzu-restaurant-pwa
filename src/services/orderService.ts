import api from './api';
import {type Order } from '../types/api.types';

export const getRestaurantOrders = async (
  restaurantId: string
): Promise<Order[]> => {
  const response = await api.get(`/orders/restaurant/${restaurantId}`);
  return response.data;
};

export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<Order> => {
  const response = await api.patch(`/orders/${orderId}`, { status });
  return response.data;
};