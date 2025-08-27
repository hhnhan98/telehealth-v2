// utils/response.js

// ------------------------- Response thành công -------------------------
const responseSuccess = (res, message, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

// Response lỗi
const responseError = (res, message, status = 500, err = null) => {
  if (err) console.error(err); // log lỗi server
  return res.status(status).json({
    success: false,
    message
  });
};

module.exports = { responseSuccess, responseError };
