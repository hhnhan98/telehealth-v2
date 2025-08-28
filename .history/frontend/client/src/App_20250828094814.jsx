import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/routes/ProtectedRoute';
import RoleBasedRoute from './components/routes/RoleBasedRoute';
import 'react-toastify/dist/ReactToastify.css';

/* Trang Admin */
import AdminDashboard from './pages/admin/AdminDashboard';

/* Trang đăng nhập, đăng ký */
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

/* Patient */
import PatientLayout from './components/layout/PatientLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import AppointmentList from './pages/patient/AppointmentList';
import BookAppointment from './pages/patient/BookAppointment';
import PatientProfile from './pages/patient/PatientProfile';
import DoctorList from './pages/patient/DoctorList';
import AppointmentForm from './pages/patient/AppointmentForm';
import PatientMedicalRe from './pages/doctor/PatientAppointmentDetail';
import AppointmentDetailDoctor from './pages/doctor/PatientAppointmentList';

/* Doctor */
import DoctorLayout from './components/layout/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import WorkSchedule from './pages/doctor/WorkSchedule';
import PatientList from './pages/doctor/PatientList';
import DoctorMedicalRecordHistory from './pages/doctor/DoctorMedicalRecordHistory';
import DoctorAppointmentDetail from './pages/doctor/DoctorAppointmentDetail';
import DoctorMedicalForm from './pages/doctor/DoctorMedicalForm';
import DoctorProfile from './pages/doctor/DoctorProfile';

function App() {
  return (
    <>
      <Routes>
        {/* Redirect root sang trang đăng nhập */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Các route không cần layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Patient routes */}
        <Route
          path="/patient/*"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['patient']}>
                <PatientLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="book-appointment" element={<BookAppointment />} />
          <Route path="appointments" element={<AppointmentList />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="doctors" element={<DoctorList />} />
          <Route path="appointment/:doctorId" element={<AppointmentForm />} />
          <Route path="medical-records" element={<PatientMedicalRecordList />} />
          <Route path="medical-records/:id" element={<PatientMedicalRecordDetail />} />

        </Route>

        {/* Doctor routes */}
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['doctor']}>
                <DoctorLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="schedule" element={<WorkSchedule />} />
          <Route path="patients" element={<PatientList />} />
          {/* Modal vẫn mở từ PatientList, nhưng route trực tiếp cũng có thể truy cập */}
          <Route path="medical-records/:patientId" element={<MedicalRecordHistory />} />
          <Route path="appointments/:id" element={<AppointmentDetailDoctor />} />
          <Route path="appointments/:id/medical-receipt" element={<DoctorMedicalForm />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>

        {/* Admin route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        {/* Fallback 404 */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>

      {/* Toast container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;