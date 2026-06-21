import api from './api';
import {type AuthResponse,type LoginRequest } from '../types/api.types';

export const loginRequest = async (dto: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', dto);
  return response.data;
};