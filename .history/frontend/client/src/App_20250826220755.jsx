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
import AppointmentDetail from './pages/patient/AppointmentDetail';
import PatientProfile from './pages/patient/PatientProfile';
import DoctorList from './pages/patient/DoctorList';
import AppointmentForm from './pages/patient/AppointmentForm';

/* Doctor */
import DoctorLayout from './components/layout/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AppointmentDetail from './pages/doctor/AppointmentDetail';
import DoctorProfile from './pages/doctor/DoctorProfile';
import MedicalForm from './pages/doctor/MedicalForm';

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
          <Route path="appointments/:id" element={<AppointmentDetail />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="doctors" element={<DoctorList />} />
          <Route path="appointment/:doctorId" element={<AppointmentForm />} />
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
          <Route path="appointments/:id" element={<AppointmentDetail />} />
          <Route path="appointments/:id/medical-receipt" element={<MedicalForm />} />
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



