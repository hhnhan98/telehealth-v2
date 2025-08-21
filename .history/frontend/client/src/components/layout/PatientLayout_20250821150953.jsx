import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';

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
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-44 bg-white border-r border-gray-200 flex-col p-5 gap-2">
        <h3 className="text-lg font-semibold mb-5">Telehealth System</h3>
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(`/patient${item.path}`)}
            className={`text-left text-sm rounded px-3 py-2 w-full transition-colors ${
              getActive(item.path)
                ? 'bg-blue-400 text-white'
                : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="mt-auto text-left text-sm rounded px-3 py-2 w-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
        >
          Đăng xuất
        </button>
      </aside>

      {/* Sidebar mobile */}
      <div
        className={`fixed inset-0 z-40 md:hidden transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out`}
      >
        <div
          className="fixed inset-0 bg-black opacity-25"
          onClick={() => setSidebarOpen(false)}
        />
        <aside className="relative bg-white w-64 h-full p-5 flex flex-col gap-2 shadow-lg">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold">Telehealth System</h3>
            <button onClick={() => setSidebarOpen(false)}>
              <HiX className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(`/patient${item.path}`);
                setSidebarOpen(false);
              }}
              className={`text-left text-sm rounded px-3 py-2 w-full transition-colors ${
                getActive(item.path)
                  ? 'bg-blue-400 text-white'
                  : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="mt-auto text-left text-sm rounded px-3 py-2 w-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            Đăng xuất
          </button>
        </aside>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-44">
        {/* Header */}
        <header className="fixed top-0 left-0 md:left-44 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-30">
          <h3 className="text-lg font-semibold">Telehealth System</h3>
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <HiMenu className="h-6 w-6 text-gray-700" />
          </button>
        </header>

        {/* Outlet / main content */}
        <main className="flex-1 mt-16 p-6 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PatientLayout;
