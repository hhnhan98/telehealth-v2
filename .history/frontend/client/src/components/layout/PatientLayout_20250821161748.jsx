// src/components/layout/PatientLayout.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-surface border-r border-gray-200 p-5 gap-2
                    ${sidebarOpen ? 'w-48' : 'w-0 overflow-hidden'} transition-[width] duration-300 relative`}
      >
        <h3 className="text-lg font-semibold mb-5 text-text">Telehealth System</h3>

        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`text-left px-4 py-2 rounded-md text-sm transition-colors duration-200
                        ${getActive(item.path)
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-primary-light hover:bg-primary hover:text-white'}`}
            onClick={() => navigate(`/patient${item.path}`)}
          >
            {item.label}
          </button>
        ))}

        <button
          className="mt-auto px-4 py-2 rounded-md text-sm bg-red-400 hover:bg-red-500 text-white transition-colors duration-200"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>

        {/* Toggle Sidebar for Mobile */}
        <button
          className="absolute top-5 right-5 sm:hidden text-text hover:text-primary"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '✖' : '☰'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-background">
        <Outlet />
      </main>
    </div>
  );
}

export default PatientLayout;
