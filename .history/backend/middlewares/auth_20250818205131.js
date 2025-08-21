const jwt = require('jsonwebtoken');
const { responseError } = require('../../utils/response');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return responseError(res, 'Không có token', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return responseError(res, 'Token đã hết hạn', 401);
    }
    return responseError(res, 'Token không hợp lệ', 401);
  }
};

module.exports = { verifyToken };

// const jwt = require('jsonwebtoken');

// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ error: 'Không có token' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = {
//       _id: decoded.id,
//       role: decoded.role,
//     };
//     next();
//   } catch (err) {
//     if (err.name === 'TokenExpiredError') {
//       return res.status(401).json({ error: 'Token đã hết hạn' });
//     }
//     res.status(401).json({ error: 'Token không hợp lệ' });
//   }
// };

// module.exports = { verifyToken };
