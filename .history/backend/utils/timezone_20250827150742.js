// scripts/seedAppointment.js
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { toUTC, toVN } = require('../utils/timezone');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ = 'Asia/Ho_Chi_Minh';

// Chuyển Date (UTC) sang giờ VN
const toVN = (dateUTC) => {
  return dayjs(dateUTC).tz(DEFAULT_TZ).toDate();
};

// Chuyển Date (VN) sang UTC
const toUTC = (dateVN) => {
  return dayjs.tz(dateVN, DEFAULT_TZ).utc().toDate();
};

// Format Date sang string theo timezone VN (optional)
const formatVN = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).tz(DEFAULT_TZ).format(format);
};

module.exports = { toVN, toUTC, formatVN };
