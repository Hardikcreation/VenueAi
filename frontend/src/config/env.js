const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').trim();
const normalizedBaseUrl = rawApiBaseUrl.replace(/\/+$/, '');

const API_BASE_URL = /\/api$/i.test(normalizedBaseUrl)
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;

export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/i, '');
export const API_URL = API_BASE_URL;
