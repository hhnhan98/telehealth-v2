import { useNavigate, Outlet, useLocation } from 'react-router-dom';

function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-44 bg-white border-r border-gray-200 flex flex-col p-5 gap-2">
        <h3 className="text-lg font-semibold mb-5">Telehealth System</h3>

        <button
          className={`text-left text-sm rounded px-3 py-2 ${
            getActive('/dashboard')
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
          }`}
          onClick={() => navigate('/patient/dashboard')}
        >
          Trang chủ
        </button>

        <button
          className={`text-left text-sm rounded px-3 py-2 ${
            getActive('/book-appointment')
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
          }`}
          onClick={() => navigate('/patient/book-appointment')}
        >
          Đặt lịch hẹn
        </button>

        <button
          className={`text-left text-sm rounded px-3 py-2 ${
            getActive('/appointments')
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
          }`}
          onClick={() => navigate('/patient/appointments')}
        >
          Lịch sử
        </button>

        <button
          className={`text-left text-sm rounded px-3 py-2 ${
            getActive('/profile')
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
          }`}
          onClick={() => navigate('/patient/profile')}
        >
          Hồ sơ cá nhân
        </button>

        <button
          className="mt-auto text-left text-sm rounded px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default PatientLayout;
