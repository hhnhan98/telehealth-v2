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
