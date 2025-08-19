// src/services/scheduleService.js
import axiosInstance from './api'; // đồng bộ với các service khác

// ------------------------- Helper -------------------------
const handleError = (err, context = 'ScheduleService') => {
  console.error(`${context} error:`, err.response?.data || err.message || err);
  throw err.response?.data || err;
};

// ------------------------- Schedule APIs -------------------------

/**
 * Lấy các khung giờ trống của bác sĩ theo ngày
 * @param {string} doctorId 
 * @param {string} date (YYYY-MM-DD)
 * @returns {Promise<Array>} danh sách khung giờ trống
 */
export const getAvailableSlots = async (doctorId, date) => {
  if (!doctorId || !date) return [];
  try {
    const res = await axiosInstance.get(`/schedule/available/${doctorId}?date=${date}`);
    return res.data?.availableSlots || [];
  } catch (err) {
    return handleError(err, 'getAvailableSlots');
  }
};

/**
 * Lấy lịch làm việc của bác sĩ theo ngày/tuần
 * @param {string} date 
 * @param {'day'|'week'} view 
 * @returns {Promise<Object>} { appointments: [...] }
 */
export const getWorkSchedule = async (date, view = 'day') => {
  if (!date) return { appointments: [] };
  try {
    const res = await axiosInstance.get(`/schedule/work-schedule?date=${date}&view=${view}`);
    return res.data || { appointments: [] };
  } catch (err) {
    return handleError(err, 'getWorkSchedule');
  }
};

/**
 * Tạo lịch làm việc mới
 * @param {string} date 
 * @param {Array} slots 
 * @returns {Promise<Object>} lịch vừa tạo
 */
export const createWorkSchedule = async (date, slots) => {
  if (!date || !slots) throw new Error('Thiếu dữ liệu lịch làm việc');
  try {
    const res = await axiosInstance.post('/schedule/create', { date, slots });
    return res.data || {};
  } catch (err) {
    return handleError(err, 'createWorkSchedule');
  }
};

/**
 * Cập nhật lịch làm việc

export const updateWorkSchedule = async (date, slots) => {
  if (!date || !slots) throw new Error('Thiếu dữ liệu lịch làm việc');
  try {
    const res = await axiosInstance.put('/schedule/update', { date, slots });
    return res.data || {};
  } catch (err) {
    return handleError(err, 'updateWorkSchedule');
  }
};

// Xóa lịch làm việc theo ngày

export const deleteWorkSchedule = async (date) => {
  if (!date) throw new Error('Thiếu ngày lịch cần xóa');
  try {
    const res = await axiosInstance.delete('/schedule/delete', { data: { date } });
    return res.data || {};
  } catch (err) {
    return handleError(err, 'deleteWorkSchedule');
  }
};

// ------------------------- Export -------------------------
const scheduleService = {
  getAvailableSlots,
  getWorkSchedule,
  createWorkSchedule,
  updateWorkSchedule,
  deleteWorkSchedule,
};

export default scheduleService;
