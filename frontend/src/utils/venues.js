import { BACKEND_BASE_URL } from '../config/env';

export const toVenueImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

export const getVenueImage = (venue) => {
  const imagePath = venue?.thumbnail || venue?.image || venue?.gallery_images?.[0] || '';
  return toVenueImageUrl(imagePath);
};

export const getVenueLocationLabel = (venue) => {
  const parts = [
    venue?.area,
    venue?.location,
    venue?.zone,
    venue?.landmark,
  ]
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set(parts)].join(', ');
};

export const matchesVenueSearch = (venue, query) => {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) return true;

  const searchableText = [
    venue?.name,
    venue?.title,
    venue?.category,
    venue?.location,
    venue?.area,
    venue?.zone,
    venue?.landmark,
    venue?.business_name,
    venue?.vendor_name,
    venue?.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
};

export const normalizeVenueResults = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};
