const BACKEND_URL = 'https://delivery-backend-alichan25.amvera.io';

export const getImageUrl = (path: string | undefined | null): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};