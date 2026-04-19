export const getErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.data?.message || error?.message || fallback;
