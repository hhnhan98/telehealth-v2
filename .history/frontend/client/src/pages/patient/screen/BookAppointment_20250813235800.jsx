import React from 'react';
import BookingForm from '../components/BookingForm';

const BookAppointment = ({ currentUser }) => {
  return (
    <div className="book-appointment-page">
      <h1>Đặt lịch khám bệnh</h1>
      {/* Truyền currentUser nếu user đã login để pre-fill thông tin bệnh nhân */}
      <BookingForm currentUser={currentUser} />
    </div>
  );
};

export default BookAppointment;
