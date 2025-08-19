// const mongoose = require('mongoose');
// const dayjs = require('dayjs');
// const utc = require('dayjs/plugin/utc');
// const timezone = require('dayjs/plugin/timezone');

// dayjs.extend(utc);
// dayjs.extend(timezone);

// const appointmentSchema = new mongoose.Schema({
//   location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
//   specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty', required: true },
//   doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
//   patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

//   datetime: { type: Date, required: true }, // UTC source

//   // optional string hiển thị VN
//   date: { type: String },
//   time: { type: String },

//   reason: { type: String, default: '' },
//   otp: String,
//   otpExpiresAt: Date,
//   isVerified: { type: Boolean, default: false },
//   status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
//   workScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
// }, { timestamps: true });

// // Middleware: auto set date/time string VN
// appointmentSchema.pre('save', function (next) {
//   if (this.datetime) {
//     const vnTime = dayjs(this.datetime).tz('Asia/Ho_Chi_Minh');
//     this.date = vnTime.format('YYYY-MM-DD');
//     this.time = vnTime.format('HH:mm');
//   }
//   next();
// });

// module.exports = mongoose.model('Appointment', appointmentSchema);
