const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API xác thực (đăng ký, đăng nhập)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký người dùng mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - role
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               email:
 *                 type: string
 *                 example: nva@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 enum: [patient, doctor, admin]
 *                 example: patient
 *               specialty:
 *                 type: string
 *                 description: Id chuyên khoa (chỉ bắt buộc nếu role=doctor)
 *                 example: 64e7b21f9f1c2a001fbc1234
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Email đã tồn tại
 *       500:
 *         description: Lỗi máy chủ
 */
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, specialty } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      specialty: role === 'doctor' ? specialty : undefined,
    });

    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công', userId: newUser._id });
  } catch (error) {
    console.error('>>> Lỗi khi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập người dùng
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: nva@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     specialty:
 *                       type: string
 *       400:
 *         description: Email không tồn tại hoặc mật khẩu không đúng
 *       500:
 *         description: Lỗi máy chủ
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không đúng' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        specialty: user.specialty || null,
      },
    });
  } catch (error) {
    console.error('>>> Lỗi khi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

module.exports = router;



// // routes/auth/auth.routes.js
// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// // Đăng ký người dùng
// router.post('/register', async (req, res) => {
//   try {
//     const { fullName, email, password, role, specialty } = req.body;

//     // Kiểm tra email đã tồn tại chưa
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email đã được đăng ký' });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Tạo user mới
//     const newUser = new User({
//       fullName,
//       email,
//       password: hashedPassword,
//       role,
//       specialty: role === 'doctor' ? specialty : undefined,
//     });

//     await newUser.save();
//     res.status(201).json({ message: 'Đăng ký thành công', userId: newUser._id });
//   } catch (error) {
//     console.error('>>> Lỗi khi đăng ký:', error);
//     res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
//   }
// });

// // Đăng nhập người dùng
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Tìm user theo email
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

//     // So sánh mật khẩu
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không đúng' });

//     // Tạo JWT token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     // Trả về token + thông tin user
//     res.status(200).json({
//       token,
//       user: {
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//         specialty: user.specialty || null,
//       },
//     });
//   } catch (error) {
//     console.error('>>> Lỗi khi đăng nhập:', error);
//     res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
//   }
// });

// module.exports = router;
