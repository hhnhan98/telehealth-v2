// src/utils/timezone.js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ = 'Asia/Ho_Chi_Minh';

/**
 * Chuyển Date (UTC) sang giờ VN
 * @param {Date|string} dateUTC
 * @returns {Date} - Giờ VN
 */
export const toVN = (dateUTC) => {
  return dayjs(dateUTC).tz(DEFAULT_TZ).toDate();
};

/**
 * Chuyển Date (VN) sang UTC
 * @param {Date|string} dateVN
 * @returns {Date} - UTC
 */
export const toUTC = (dateVN) => {
  return dayjs.tz(dateVN, DEFAULT_TZ).utc().toDate();
};

// Format Date sang string theo timezone VN
export const formatVN = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).tz(DEFAULT_TZ).format(format);
};
