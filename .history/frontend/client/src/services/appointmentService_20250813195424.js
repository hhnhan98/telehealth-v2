import axios from '../axiosInstance';

export const createAppointment = async (appointmentData) => {
  const token = localStorage.getItem('token');
  const res = await axios.post('/appointments', appointmentData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};
