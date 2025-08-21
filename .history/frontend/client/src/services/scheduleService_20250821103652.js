import axios from 'axios';

const API_URL = 'http://your-api-url.com'; // Thay đổi URL cho phù hợp

const fetchDoctorSchedule = async (dateRange) => {
    const response = await axios.get(`${API_URL}/doctor/work-schedule`, {
        params: { view: dateRange },
    });
    return response.data;
};

const updateAppointmentStatus = async (id, data) => {
    await axios.put(`${API_URL}/appointments/${id}`, data);
};

const cancelAppointment = async (id) => {
    await axios.delete(`${API_URL}/appointments/${id}`);
};

export default scheduleService = {
    fetchDoctorSchedule,
    updateAppointmentStatus,
    cancelAppointment,
};
