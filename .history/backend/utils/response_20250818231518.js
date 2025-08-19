// utils/response.js

/**
 / Response thành công

const success = (res, message, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

/**
 * Response lỗi
 * @param {Object} res - Express response
 * @param {string} message - Thông báo lỗi
 * @param {number} [status=400] - HTTP status code
 * @param {Error} [err] - Optional lỗi để log server
 */
const error = (res, message, status = 400, err = null) => {
  if (err) console.error(err); // log server
  return res.status(status).json({
    success: false,
    message
  });
};

/**
 * Response trả về danh sách (mảng)
 * @param {Object} res - Express response
 * @param {Array} list - Mảng dữ liệu
 * @param {string} [message='Danh sách'] - Thông báo
 */
const listSuccess = (res, list, message = 'Danh sách') => {
  return res.status(200).json({
    success: true,
    message,
    count: Array.isArray(list) ? list.length : 0,
    data: list
  });
};

module.exports = { success, error, listSuccess };
