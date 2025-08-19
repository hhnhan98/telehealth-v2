import axiosInstance from '../utils/axiosInstance';

export const getAllLocations = async () => {
  const res = await axiosInstance.get('/locations');
  return res.data;
};
