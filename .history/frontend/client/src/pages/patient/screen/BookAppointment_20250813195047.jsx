import React, { useEffect, useState } from 'react';
import { getAllLocations } from '../../../services/locationService';

const BookAppointment = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getAllLocations();
        setLocations(data);
      } catch (error) {
        console.error('Lỗi khi tải danh sách địa điểm:', error);
      }
    };
    fetchLocations();
  }, []);

  return (
    <div>
      <label>Chọn địa điểm:</label>
      <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
        <option value="">-- Chọn địa điểm --</option>
        {locations.map((loc) => (
          <option key={loc._id} value={loc._id}>
            {loc.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BookAppointment;
