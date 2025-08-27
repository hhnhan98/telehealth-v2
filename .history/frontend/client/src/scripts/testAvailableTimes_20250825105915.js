// src/components/TestAvailableTimes.jsx
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ = 'Asia/Ho_Chi_Minh';

const formatVN = (date, format = 'HH:mm') => {
  const d = dayjs(date);
  if (!d.isValid()) return 'Invalid Date';
  return d.tz(DEFAULT_TZ).format(format);
};

const TestAvailableTimes = () => {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    // Giả lập dữ liệu từ backend
    const mockTimes = [
      { time: '08:00', datetime: '2025-08-25T01:00:00.000Z' },
      { time: '08:30', datetime: '2025-08-25T01:30:00.000Z' },
      { time: '09:00', datetime: 'invalid-date' },  // Test slot xấu
      { time: '09:30', datetime: '2025-08-25T02:30:00.000Z' },
    ];

    setAvailableTimes(mockTimes);

    // Log để debug
    mockTimes.forEach((slot, index) => {
      const formatted = formatVN(slot.datetime);
      console.log(`Slot ${index}: Original=${slot.datetime}, VN=${formatted}`);
    });
  }, []);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h3>Test Select Available Times</h3>
      <select
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
      >
        <option value="">Chọn giờ khám</option>
        {availableTimes.map((slot, index) => {
          const formattedTime = formatVN(slot.datetime);
          return (
            <option key={`${slot.time}-${index}`} value={slot.time}>
              {formattedTime}
            </option>
          );
        })}
      </select>
      {selectedTime && <p>Bạn chọn: {selectedTime}</p>}
    </div>
  );
};

export default TestAvailableTimes;
