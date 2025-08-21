import api from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

const fetchDoctorSchedule = async (view = 'day') => {
  try {
    const res = await api.get('/doctor/work-schedule', { params: { view } });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchDoctorSchedule');
  }
};

const scheduleService = { fetchDoctorSchedule };
export default scheduleService;
