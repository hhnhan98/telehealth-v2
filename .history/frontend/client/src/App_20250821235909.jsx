import { Routes, Route, Navigate } from 'react-router-dom';
/* Trang Admin: đang phát triển */
import AdminDashboard from './pages/admin/AdminDashboard';

/* Trang đăng nhập, đăng ký */
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

/* Patient */
import PatientLayout from './components/layout/PatientLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import AppointmentList from './pages/patient/AppointmentList';
import BookAppointment from './pages/patient/BookAppointment';
import MedicalRecordList from './pages/patient/MedicalRecordList';
import AppointmentDetail from './pages/patient/AppointmentDetail';
import PatientProfile from './pages/patient/PatientProfile';

/* Doctor */
import DoctorLayout from './components/layout/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientList from './pages/doctor/PatientList';
import DoctorProfile from './pages/doctor/DoctorProfile';
import CreateMedicalRecord from './pages/doctor/CreateMedicalRecord';

function App() {
  return (
    <Routes>
      {/* Redirect root sang trang đăng nhập */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Các route không cần layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Patient routes có layout riêng */}
      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="appointments/:id" element={<AppointmentDetail />} />
        <Route path="profile" element={<PatientProfile />} />
      </Route>

      {/* Doctor routes có layout riêng */}
      <Route path="/doctor" element={<DoctorLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<PatientList />} />
         <Route path="medical-records" element={<MedicalRecordList />} />
        <Route path="medical-records/create" element={<CreateMedicalRecord />} />
        <Route path="profile" element={<DoctorProfile />} />
      </Route>

      <Route path="/admin" element={<AdminDashboard />} />

      {/* Route fallback cho 404 */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;