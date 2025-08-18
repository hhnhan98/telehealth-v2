/* DoctorDashboard.css */

/* Container chính */
.doctor-dashboard {
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9f9f9;
  min-height: 100vh;
}

/* Tiêu đề */
.dashboard-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

/* --- Cards tổng quan --- */
.cards {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  flex: 1;
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 18px rgba(0,0,0,0.12);
}

.card-icon {
  color: #fff;
  padding: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-today .card-icon {
  background-color: #4caf50;
}

.card-week .card-icon {
  background-color: #2196f3;
}

.card-info h3 {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.card-info p {
  margin: 5px 0 0 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

/* --- Timeline lịch hẹn hôm nay --- */
.today-appointments {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.today-appointments h3 {
  margin-bottom: 15px;
  font-size: 20px;
  color: #333;
}

/* Timeline */
.appointments-timeline {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.appointment-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border-left: 4px solid #2196f3;
  background-color: #f1f8ff;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.appointment-card:hover {
  background-color: #e0f0ff;
}

.appt-time {
  font-weight: bold;
  font-size: 16px;
  width: 80px;
  color: #333;
}

.appt-info {
  flex: 1;
}

.appt-patient {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.appt-reason {
  margin: 2px 0;
  color: #555;
}

.appt-status {
  font-size: 14px;
  color: #999;
}

/* Loading & Error */
.loading, .error {
  text-align: center;
  font-size: 16px;
  color: #666;
  margin-top: 50px;
}
