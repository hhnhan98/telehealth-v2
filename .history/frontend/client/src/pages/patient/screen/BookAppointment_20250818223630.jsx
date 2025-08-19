// src/pages/patient/screen/BookAppointment.jsx
import React from 'react';
import BookingForm from '../components/AppointmentForm';
import './BookAppointment.css';

const BookAppointment = ({ currentUser }) => {
  return (
    <main className="book-appointment-page">
      <header className="book-appointment-header">
        <h1>Đặt lịch khám bệnh</h1>
        <p>Vui lòng điền thông tin để đặt lịch với bác sĩ.</p>
      </header>

      <section className="book-appointment-form">
        {/* Truyền currentUser nếu user đã login để pre-fill thông tin bệnh nhân */}
        <BookingForm currentUser={currentUser} />
      </section>
    </main>
  );
};

export default BookAppointment;
