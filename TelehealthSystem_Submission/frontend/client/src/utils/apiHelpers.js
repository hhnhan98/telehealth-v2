// src/utils/apiHelpers.js

/**
 * Xử lý response từ backend
 * Chuẩn hóa kết quả để FE chỉ cần check success/data/message
 */
export const handleApiResponse = (res) => {
  if (res?.data?.success) {
    return {
      success: true,
      data: res.data.data ?? null,
      message: res.data.message ?? 'Success',
    };
  }
  return {
    success: false,
    data: null,
    message: res?.data?.message || 'Request failed',
  };
};

/**
 * Xử lý error khi call API (network error, 500, timeout...)
 */
export const handleApiError = (err, context = '') => {
  const msg =
    err?.response?.data?.message ||
    err?.message ||
    'Unknown error';

  console.error(`[API] ${context} error:`, msg);

  return {
    success: false,
    data: null,
    message: msg,
  };
};
