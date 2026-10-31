export function getErrorMessage(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (typeof error?.message === 'string' && error.message !== 'Network Error') {
    return error.message;
  }
  if (error?.code === 'ERR_NETWORK') {
    return 'Cannot reach the server. Is the Express proxy running?';
  }
  return fallback;
}

export function getFieldErrors(error) {
  return error?.response?.data?.errors || {};
}
