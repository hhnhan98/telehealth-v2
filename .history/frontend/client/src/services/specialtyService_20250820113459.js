import api from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

const fetchSpecialties = async () => {
  try {
    const res = await api.get('/specialties');
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchSpecialties');
  }
};

const fetchSpecialtiesByLocation = async (locationId) => {
  try {
    const res = await api.get('/specialties', { params: { locationId } });
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchSpecialtiesByLocation');
  }
};

const specialtyService = {
  fetchSpecialties,
  fetchSpecialtiesByLocation,
};

export default specialtyService;
