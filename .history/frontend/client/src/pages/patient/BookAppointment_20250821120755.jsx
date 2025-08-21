// src/pages/patient/screen/BookAppointment.jsx
import React from 'react';
import BookingForm from './';
//import './BookAppointment.css';

const BookAppointment = ({ currentUser }) => {
  return (
    <main className="book-appointment-page">
      <section className="book-appointment-form">
        {/* Truyền currentUser nếu user đã login để pre-fill thông tin bệnh nhân */}
        <BookingForm currentUser={currentUser} />
      </section>
    </main>
  );
};

export default BookAppointment;
