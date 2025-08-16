import axios from '../utils/axiosInstance';

export const fetchLocations = async () => (await axios.get('/appointments/locations')).data;
export const fetchSpecialties = async (locationId) => (await axios.get(`/appointments/specialties?locationId=${locationId}`)).data;
export const fetchDoctors = async (locationId, specialtyId) => (await axios.get(`/appointments/doctors?locationId=${locationId}&specialtyId=${specialtyId}`)).data;
export const fetchAvailableSlots = async (doctorId, date) => (await axios.get(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`)).data;
export const createAppointment = async (data) => (await axios.post('/appointments', data)).data;
export const verifyOtp = async (appointmentId, otp) => (await axios.post('/appointments/verify-otp', { appointmentId, otp })).data;
export const cancelAppointment = async (appointmentId) => (await axios.delete(`/appointments/${appointmentId}`)).data;
export const fetchAppointments = async () => (await axios.get('/appointments')).data;
