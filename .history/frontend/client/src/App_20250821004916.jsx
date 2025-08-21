import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard';

/* Trang đăng nhập, đăng ký */
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UserProfile from './pages/components/shared/UserProfile';

/* Patient */
import PatientLayout from './pages/patient/layout/PatientLayout';
import PatientDashboard from './pages/patient/screen/PatientDashboard';
import AppointmentList from './pages/patient/sections/AppointmentList';
import BookAppointment from './pages/patient/screen/BookAppointment';
import MedicalRecordList from './pages/patient/screen/MedicalRecordList';
import MedicalRecordDetail from './pages/patient/screen/MedicalRecordDetail';
import PatientProfile from './pages/patient/screen/PatientProfile';

/* Doctor */
import DoctorLayout from './pages/doctor/layout/DoctorLayout';
import DoctorDashboard from './pages/doctor/screen/DoctorDashboard';
import PatientList from './pages/doctor/screen/PatientList';
import DoctorSchedule from './pages/doctor/screen/DoctorSchedule';
import MedicalRecordForm from './pages/doctor/screen/MedicalRecordForm';
import DoctorProfile from './pages/doctor/screen/DoctorProfile';

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
        <Route path="profile" element={<UserProfile role="patient" />} />
        <Route path="medical-records" element={<MedicalRecordList />} />
        <Route path="medical-records/:id" element={<MedicalRecordDetail />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
      </Route>

      {/* Doctor routes có layout riêng */}
      <Route path="/doctor" element={<DoctorLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="schedule" element={<DoctorSchedule />} />
        <Route path="medical-records" element={<MedicalRecordList />} />
        <Route path="medical-records/create" element={<MedicalRecordForm />} />
        <Route path="medical-records/:id" element={<MedicalRecordDetail />} />   
        <Route path="/profile" element={<DoctorProfile />} />      
      </Route>

      <Route path="/admin" element={<AdminDashboard />} />

    </Routes>

    
  );
}

export default App;