import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { HiMenu } from 'react-icons/hi';

function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Trang chủ', path: '/dashboard' },
    { label: 'Đặt lịch hẹn', path: '/book-appointment' },
    { label: 'Lịch sử', path: '/appointments' },
    { label: 'Hồ sơ cá nhân', path: '/profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-48 bg-white border-r border-gray-200 flex-col p-5 gap-2 z-20">
        <h3 className="text-lg font-semibold mb-5">Telehealth System</h3>
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(`/patient${item.path}`)}
            className={`text-left text-sm rounded px-3 py-2 w-full ${
              getActive(item.path)
                ? 'bg-blue-500 text-white'
                : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          className="mt-auto text-left text-sm rounded px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 w-full"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black opacity-25" onClick={() => setSidebarOpen(false)}></div>
          <aside className="relative bg-white w-64 h-full p-5 flex flex-col gap-2">
            <h3 className="text-lg font-semibold mb-5">Telehealth System</h3>
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(`/patient${item.path}`);
                  setSidebarOpen(false);
                }}
                className={`text-left text-sm rounded px-3 py-2 w-full ${
                  getActive(item.path)
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              className="mt-auto text-left text-sm rounded px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 w-full"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-48">
        {/* Header */}
        <header className="fixed top-0 left-0 md:left-48 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-30">
          <h3 className="text-lg font-semibold">Telehealth System</h3>
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <HiMenu className="h-6 w-6 text-gray-700" />
          </button>
        </header>

        {/* Outlet / content */}
        <main className="flex-1 mt-16 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PatientLayout;
