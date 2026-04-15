const parseList = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean);
    }
  } catch (error) {
    // Fall back to comma-separated parsing.
  }

  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const serializeList = (value) => JSON.stringify(parseList(value));

const formatProduct = (product) => ({
  ...product,
  gallery_images: parseList(product.gallery_images),
  occasion_types: parseList(product.occasion_types),
  features: parseList(product.features),
  latitude: product.latitude !== null && product.latitude !== undefined ? Number(product.latitude) : null,
  longitude: product.longitude !== null && product.longitude !== undefined ? Number(product.longitude) : null
});

module.exports = { parseList, serializeList, formatProduct };
