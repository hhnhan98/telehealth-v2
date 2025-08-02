const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const Message = require('../models/Message');

// ✅ Lấy tất cả tin nhắn giữa 2 người dùng
router.get('/:user1/:user2', verifyToken, async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ createdAt: 1 }); // sắp xếp theo thời gian tăng dần

    res.json(messages);
  } catch (error) {
    console.error('Lỗi lấy tin nhắn:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy tin nhắn', error: error.message });
  }
});

module.exports = router;
