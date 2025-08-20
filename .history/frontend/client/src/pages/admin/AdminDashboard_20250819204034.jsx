import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [formUser, setFormUser] = useState({ fullName: '', email: '', password: '', role: 'patient', specialty: '', location: '' });

  // ================= Fetch Data =================
  const fetchAll = async () => {
    try {
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
      alert('Lỗi khi tải dữ liệu');
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ================= Users =================
  const createUser = async () => {
    try {
      if (!formUser.fullName || !formUser.email || !formUser.password) {
        return alert('Vui lòng điền đủ thông tin user');
      }
      if (formUser.role === 'doctor' && (!formUser.specialty || !formUser.location)) {
        return alert('Bác sĩ phải có chuyên khoa và cơ sở');
      }

      const payload = {
        fullName: formUser.fullName,
        email: formUser.email,
        password: formUser.password,
        role: formUser.role
      };

      const userRes = await axios.post('/admin/users', payload);
      const userId = userRes.data.data._id;

      // Nếu là bác sĩ, tạo Doctor record
      if (formUser.role === 'doctor') {
        await axios.post('/admin/doctors', {
          user: userId,
          specialty: formUser.specialty,
          location: formUser.location
        });
      }

      setFormUser({ fullName: '', email: '', password: '', role: 'patient', specialty: '', location: '' });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tạo user');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Xác nhận xóa user?')) return;
    try {
      await axios.delete(`/admin/users/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa user');
    }
  };

  const resetPassword = async (id) => {
    if (!window.confirm('Xác nhận reset mật khẩu?')) return;
    try {
      await axios.post(`/admin/users/${id}/reset-password`);
      alert('Reset mật khẩu thành công');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi reset mật khẩu');
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => setActiveTab('users')}>Users</button>
        <button onClick={() => setActiveTab('doctors')}>Doctors</button>
        <button onClick={() => setActiveTab('locations')}>Locations</button>
        <button onClick={() => setActiveTab('specialties')}>Specialties</button>
      </div>

      {activeTab === 'users' && (
        <div>
          <h2>Create User</h2>
          <div>
            <input placeholder="Full Name" value={formUser.fullName} onChange={e => setFormUser({ ...formUser, fullName: e.target.value })} />
            <input placeholder="Email" value={formUser.email} onChange={e => setFormUser({ ...formUser, email: e.target.value })} />
            <input placeholder="Password" type="password" value={formUser.password} onChange={e => setFormUser({ ...formUser, password: e.target.value })} />
            <select value={formUser.role} onChange={e => setFormUser({ ...formUser, role: e.target.value })}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>

            {formUser.role === 'doctor' && (
              <>
                <select value={formUser.specialty} onChange={e => setFormUser({ ...formUser, specialty: e.target.value })}>
                  <option value="">Select Specialty</option>
                  {specialties.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <select value={formUser.location} onChange={e => setFormUser({ ...formUser, location: e.target.value })}>
                  <option value="">Select Location</option>
                  {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                </select>
              </>
            )}
            <button onClick={createUser}>Create User</button>
          </div>

          <h2>Users List</h2>
          <ul>
            {users.map(u => (
              <li key={u._id}>
                {u.fullName} ({u.email}, {u.role})
                <button onClick={() => deleteUser(u._id)}>Delete</button>
                <button onClick={() => resetPassword(u._id)}>Reset Password</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div>
          <h2>Doctors</h2>
          <ul>
            {doctors.map(d => (
              <li key={d._id}>
                {d.user?.fullName} - {d.specialty?.name} - {d.location?.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'locations' && (
        <div>
          <h2>Locations</h2>
          <ul>
            {locations.map(l => (
              <li key={l._id}>{l.name}</li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'specialties' && (
        <div>
          <h2>Specialties</h2>
          <ul>
            {specialties.map(s => (
              <li key={s._id}>{s.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
