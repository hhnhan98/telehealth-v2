// utils/timezone.js
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ = 'Asia/Ho_Chi_Minh';

/**
 * Chuyển Date (UTC) sang giờ VN
 * @param {Date|string} dateUTC
 * @returns {Date}
 */
const toVN = (dateUTC) => {
  return dayjs(dateUTC).tz(DEFAULT_TZ).toDate();
};

/**
 * Chuyển Date (VN) sang UTC
 * @param {Date|string} dateVN
 * @returns {Date}
 */
const toUTC = (dateVN) => {
  return dayjs.tz(dateVN, DEFAULT_TZ).utc().toDate();
};

/**
 * Format Date sang string theo timezone VN (optional)
 * @param {Date|string} date
 * @param {string} format
 * @returns {string}
 */
const formatVN = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).tz(DEFAULT_TZ).format(format);
};

module.exports = { toVN, toUTC, formatVN };
