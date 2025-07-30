const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');

// Load biến môi trường
dotenv.config();

// Kết nối MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/patient', require('./routes/patient.routes'));
app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/medical-records', require('./routes/medicalRecord.routes'));
app.use('/api/specialties', require('./routes/specialties.routes'));
app.use('/api/doctors', require('./routes/doctor.routes'));

// Route kiểm tra
app.get('/', (req, res) => {
  res.send('✅ Backend is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});