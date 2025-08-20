import api from '../utils/axiosInstance';
import { handleApiResponse, handleApiError } from '../utils/apiHelpers';

const fetchLocations = async () => {
  try {
    const res = await api.get('/locations');
    return handleApiResponse(res);
  } catch (err) {
    return handleApiError(err, 'fetchLocations');
  }
};

const locationService = { fetchLocations };
export default locationService;
