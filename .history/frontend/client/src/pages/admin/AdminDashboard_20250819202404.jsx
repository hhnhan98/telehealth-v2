import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersRes, doctorsRes, locationsRes, specialtiesRes] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/doctors'),
        axios.get('/admin/locations'),
        axios.get('/admin/specialties')
      ]);
      setUsers(usersRes.data.data);
      setDoctors(doctorsRes.data.data);
      setLocations(locationsRes.data.data);
      setSpecialties(specialtiesRes.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ================= Users =================
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa user này?')) return;
    try {
      await axios.delete(`/admin/users/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Xóa user thất bại');
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm('Reset mật khẩu về 123456?')) return;
    try {
      await axios.post(`/admin/users/${id}/reset-password`);
      alert('Reset thành công');
    } catch (err) {
      console.error(err);
      alert('Reset thất bại');
    }
  };

  // ================= Doctors =================
  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa doctor này?')) return;
    try {
      await axios.delete(`/admin/doctors/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Xóa doctor thất bại');
    }
  };

  // ================= Locations =================
  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa location này?')) return;
    try {
      await axios.delete(`/admin/locations/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Xóa location thất bại');
    }
  };

  // ================= Specialties =================
  const handleDeleteSpecialty = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa specialty này?')) return;
    try {
      await axios.delete(`/admin/specialties/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Xóa specialty thất bại');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      {/* ===== Users ===== */}
      <section>
        <h2>Users</h2>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button onClick={() => handleResetPassword(u._id)}>Reset Password</button>{' '}
                  <button onClick={() => handleDeleteUser(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ===== Doctors ===== */}
      <section>
        <h2>Doctors</h2>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Specialty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(d => (
              <tr key={d._id}>
                <td>{d.user?.fullName}</td>
                <td>{d.user?.email}</td>
                <td>{d.location?.name}</td>
                <td>{d.specialty?.name}</td>
                <td>
                  <button onClick={() => handleDeleteDoctor(d._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ===== Locations ===== */}
      <section>
        <h2>Locations</h2>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(l => (
              <tr key={l._id}>
                <td>{l.name}</td>
                <td>
                  <button onClick={() => handleDeleteLocation(l._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ===== Specialties ===== */}
      <section>
        <h2>Specialties</h2>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {specialties.map(s => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>
                  <button onClick={() => handleDeleteSpecialty(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;
