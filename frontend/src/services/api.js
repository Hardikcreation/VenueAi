import { API_URL } from '../config/env';

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config = {
    method: options.method || 'GET',
    headers: {
      ...options.headers,
    },
    ...options,
  };

  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      typeof payload === 'string' ? payload : payload.message || `Request failed: ${response.status}`
    );
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload;
};

export const authAPI = {
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  signup: (userData) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

export const productAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await apiRequest(`/products${query ? `?${query}` : ''}`);
    return Array.isArray(response) ? response : response.data || [];
  },

  getById: (id) =>
    apiRequest(`/products/${id}`),
};

export const searchAPI = {
  searchVenues: (query) => {
    const queryString = new URLSearchParams(query).toString();
    return apiRequest(`/search${queryString ? `?${queryString}` : ''}`);
  },
};

export const vendorAPI = {
  getProfile: () =>
    apiRequest('/vendor/profile'),

  updateProfile: (data) =>
    apiRequest('/vendor/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getMyVenue: () =>
    apiRequest('/vendor/my-venue'),

  getMyListings: () =>
    apiRequest('/vendor/my-listings'),

  addVenue: (data) =>
    apiRequest('/vendor/venue', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  updateVenue: (data) =>
    apiRequest('/vendor/my-venue', {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  uploadImages: (formData) =>
    apiRequest('/vendor/images', {
      method: 'POST',
      body: formData,
    }),

  getImages: () =>
    apiRequest('/vendor/images'),

  uploadVerificationDocument: (formData) =>
    apiRequest('/vendor/verification', {
      method: 'POST',
      body: formData,
    }),

  getBookingRequests: () =>
    apiRequest('/bookings/vendor'),

  updateBookingStatus: (id, status) =>
    apiRequest(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const adminAPI = {
  getStats: () =>
    apiRequest('/admin/stats'),

  getAllUsers: () =>
    apiRequest('/admin/users'),

  deleteUser: (id) =>
    apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  getAllVendors: () =>
    apiRequest('/admin/vendors'),

  getVendorDetails: (vendorId) =>
    apiRequest(`/admin/vendors/${vendorId}`),

  approveVendor: (vendorId) =>
    apiRequest(`/admin/vendors/${vendorId}/approve`, {
      method: 'PATCH',
    }),

  rejectVendor: (vendorId) =>
    apiRequest(`/admin/vendors/${vendorId}/reject`, {
      method: 'DELETE',
    }),

  updateProductStatus: (id, status) =>
    apiRequest(`/admin/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const bookingAPI = {
  getAvailability: (productId) =>
    apiRequest(`/bookings/availability/${productId}`),

  create: (data) =>
    apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyBookings: () =>
    apiRequest('/bookings/my'),
};
