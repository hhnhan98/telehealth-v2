// checkPatient.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Patient = require('./models/Patient');

const MONGO_URI = 'mongodb://127.0.0.1:27017/telehealth'; // thay bằng URI của bạn

const emailToCheck = 'patient_d@demo.com'; // email vừa đăng ký

async function checkPatient() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Tìm user theo email
    const user = await User.findOne({ email: emailToCheck.trim().toLowerCase() });
    if (!user) {
      console.log(`Không tìm thấy user với email: ${emailToCheck}`);
      return;
    }

    console.log(`Found user: ${user.fullName} (${user._id})`);

    // Tìm patient theo userId
    const patientDoc = await Patient.findOne({ user: user._id });
    if (patientDoc) {
      console.log('Patient document tồn tại:', patientDoc);
    } else {
      console.log('Patient document KHÔNG tồn tại cho user này');
    }

    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (err) {
    console.error('Error checking patient:', err);
  }
}

checkPatient();
