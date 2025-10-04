import api from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ = 'Asia/Ho_Chi_Minh';

const fetchDoctorSchedule = async (view = 'day') => {
  try {
    const res = await api.get('/doctors/work-schedule', { params: { view } });
    const data = handleApiResponse(res);

    // Chuyển toàn bộ datetime từ UTC → VN
    if (data?.data?.appointments) {
      data.data.appointments = data.data.appointments.map(a => ({
        ...a,
        datetimeVN: dayjs(a.datetime).tz(DEFAULT_TZ).format('YYYY-MM-DD HH:mm')
      }));
    }

    return data;
  } catch (err) {
    return handleApiError(err, 'fetchDoctorSchedule');
  }
};

const scheduleService = { fetchDoctorSchedule };
export default scheduleService;
