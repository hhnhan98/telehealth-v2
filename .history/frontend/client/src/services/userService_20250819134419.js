// // src/services/userService.js
// import axiosInstance from '../utils/axiosInstance';

// // ------------------------- Helper -------------------------
// const handleError = (err, context = '') => {
//   console.error(`${context} error:`, err.response?.data || err.message || err);
//   throw err.response?.data || err;
// };

// // ------------------------- User Profile APIs -------------------------

// // Lấy thông tin user hiện tại
// export const fetchUserProfile = async () => {
//   try {
//     const res = await axiosInstance.get('/users/me');
//     return res.data.user || res.data; // đảm bảo trả về object user
//   } catch (err) {
//     return handleError(err, 'fetchUserProfile');
//   }
// };

// // Cập nhật hồ sơ cá nhân
// export const updateMyProfile = async (updatedData) => {
//   try {
//     const res = await axiosInstance.put('/users/me', updatedData);
//     return res.data.user || res.data;
//   } catch (err) {
//     return handleError(err, 'updateMyProfile');
//   }
// };

// // ------------------------- Admin / User Management APIs -------------------------

// // Lấy danh sách tất cả user (dành cho admin)
// export const fetchAllUsers = async (queryParams = {}) => {
//   try {
//     const query = new URLSearchParams(queryParams).toString();
//     const res = await axiosInstance.get(`/users${query ? '?' + query : ''}`);
//     return res.data.users || [];
//   } catch (err) {
//     return handleError(err, 'fetchAllUsers');
//   }
// };

// // Lấy danh sách bác sĩ theo chuyên khoa
// export const fetchDoctorsBySpecialty = async (specialty) => {
//   if (!specialty) return [];
//   try {
//     const res = await axiosInstance.get(`/users/doctors?specialty=${specialty}`);
//     return res.data.doctors || [];
//   } catch (err) {
//     return handleError(err, 'fetchDoctorsBySpecialty');
//   }
// };

// // ------------------------- Export -------------------------
// const userService = {
//   fetchUserProfile,
//   updateMyProfile,
//   fetchAllUsers,
//   fetchDoctorsBySpecialty,
// };

// export default userService;
