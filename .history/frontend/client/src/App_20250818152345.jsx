import { Routes, Route, Navigate } from 'react-router-dom';

/* Trang đăng nhập, đăng ký */
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

/* Patient */
import PatientLayout from './pages/patient/layout/PatientLayout';
import PatientDashboard from './pages/patient/screen/PatientDashboard';
import AppointmentList from './pages/patient/sections/AppointmentList';
import BookAppointment from './pages/patient/screen/BookAppointment';
import MedicalRecordList from './pages/patient/screen/MedicalRecordList';
import MedicalRecordDetail from './pages/patient/screen/MedicalRecordDetail';

/* Shared Profile */
import UserProfile from './pages/components/shared/UserProfile';

/* Doctor */
import DoctorLayout from './pages/doctor/layout/DoctorLayout';
import DoctorDashboard from './pages/doctor/screen/DoctorDashboard';
import PatientList from './pages/doctor/screen/PatientList';
import DoctorSchedule from './pages/doctor/screen/DoctorSchedule';
import MedicalRecordForm from './pages/doctor/screen/MedicalRecordForm';

/* Lấy currentUser từ localStorage */
const currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

/* Route guard cho patient/doctor */
const ProtectedRoute = ({ children, role }) => {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Redirect root sang trang đăng nhập */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Các route không cần layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Patient routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute role="patient">
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route
          path="profile"
          element={<UserProfile currentUser={currentUser} role="patient" />}
        />
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="medical-records" element={<MedicalRecordList />} />
        <Route path="medical-records/:id" element={<MedicalRecordDetail />} />
      </Route>

      {/* Doctor routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute role="doctor">
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="schedule" element={<DoctorSchedule />} />
        <Route path="medical-records" element={<MedicalRecordList />} />
        <Route path="medical-records/create" element={<MedicalRecordForm />} />
        <Route path="medical-records/:id" element={<MedicalRecordDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
