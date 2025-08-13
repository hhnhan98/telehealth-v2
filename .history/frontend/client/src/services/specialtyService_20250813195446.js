import axios from '../utils/axiosInstance';

export const getAllSpecialties = async () => {
  const res = await axios.get('/specialties');
  return res.data;
};
