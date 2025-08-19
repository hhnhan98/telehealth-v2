// utils/response.js

// ------------------------- Response thành công -------------------------
const responseSuccess = (res, message, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

// ------------------------- Response lỗi -------------------------
const responseError = (res, message, status = 500, err = null) => {
  if (err) console.error(err); // log lỗi server
  return res.status(status).json({
    success: false,
    message
  });
};

// ------------------------- Response danh sách (mảng) -------------------------
const responseListSuccess = (res, list, message = 'Danh sách', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    count: Array.isArray(list) ? list.length : 0,
    data: list
  });
};

module.exports = { responseSuccess, responseError };
