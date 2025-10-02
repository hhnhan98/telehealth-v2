import { Link } from 'react-router-dom';

export default function DoctorSidebar() {
  return (
    <aside className="w-64 h-screen bg-white border-r">
      <nav className="p-4">
        <h2 className="text-xl font-bold mb-4">Bác sĩ</h2>
        <ul className="space-y-3">
          <li>
            <Link to="/doctor/schedule" className="hover:underline">📆 Lịch làm việc</Link>
          </li>
          <li>
            <Link to="/doctor/available-slots" className="hover:underline">⏰ Khung giờ trống</Link>
          </li>
          <li>
            <Link to="/doctor/profile" className="hover:underline">👤 Hồ sơ cá nhân</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
