const Message = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected');

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User joined room ${roomId}`);
    });

    socket.on('sendMessage', async (data) => {
      const { sender, receiver, content } = data;

      const message = new Message({ sender, receiver, content });
      await message.save();

      const roomId = [sender, receiver].sort().join('-');
      io.to(roomId).emit('receiveMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected');
    });
  });
};