import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const AdminDashboard = () => {
  // --- State ---
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [userForm, setUserForm] = useState({ fullName: '', email: '', password: '', role: 'patient' });
  const [locationForm, setLocationForm] = useState({ name: '' });
  const [specialtyForm, setSpecialtyForm] = useState({ name: '', location: '' });

  const [editUserId, setEditUserId] = useState(null);
  const [editLocationId, setEditLocationId] = useState(null);
  const [editSpecialtyId, setEditSpecialtyId] = useState(null);

  // --- Fetch Data ---
  const fetchData = async () => {
    try {
      const [uRes, lRes, sRes] = await Promise.all([
        axiosInstance.get('/admin/users'),
        axiosInstance.get('/admin/locations'),
        axiosInstance.get('/admin/specialties'),
      ]);
      setUsers(uRes.data.data);
      setLocations(lRes.data.data);
      setSpecialties(sRes.data.data);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi load dữ liệu Admin');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Users CRUD ---
  const saveUser = async () => {
    try {
      if (editUserId) {
        await axiosInstance.put(`/admin/users/${editUserId}`, userForm);
        setEditUserId(null);
      } else {
        await axiosInstance.post('/admin/users', userForm);
      }
      setUserForm({ fullName: '', email: '', password: '', role: 'patient' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu user');
    }
  };

  const editUser = (user) => {
    setEditUserId(user._id);
    setUserForm({ fullName: user.fullName, email: user.email, role: user.role, password: '' });
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Xóa user này?')) return;
    await axiosInstance.delete(`/admin/users/${id}`);
    fetchData();
  };

  const resetPassword = async (id) => {
    if (!window.confirm('Reset mật khẩu user này về 123456?')) return;
    await axiosInstance.post(`/admin/users/${id}/reset-password`);
    alert('Reset thành công!');
  };

  // --- Locations CRUD ---
  const saveLocation = async () => {
    try {
      if (editLocationId) {
        await axiosInstance.put(`/admin/locations/${editLocationId}`, locationForm);
        setEditLocationId(null);
      } else {
        await axiosInstance.post('/admin/locations', locationForm);
      }
      setLocationForm({ name: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu location');
    }
  };

  const editLocation = (loc) => {
    setEditLocationId(loc._id);
    setLocationForm({ name: loc.name });
  };

  const deleteLocation = async (id) => {
    if (!window.confirm('Xóa location này?')) return;
    await axiosInstance.delete(`/admin/locations/${id}`);
    fetchData();
  };

  // --- Specialties CRUD ---
  const saveSpecialty = async () => {
    try {
      if (editSpecialtyId) {
        await axiosInstance.put(`/admin/specialties/${editSpecialtyId}`, specialtyForm);
        setEditSpecialtyId(null);
      } else {
        await axiosInstance.post('/admin/specialties', specialtyForm);
      }
      setSpecialtyForm({ name: '', location: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu specialty');
    }
  };

  const editSpecialty = (s) => {
    setEditSpecialtyId(s._id);
    setSpecialtyForm({ name: s.name, location: s.location?._id || '' });
  };

  const deleteSpecialty = async (id) => {
    if (!window.confirm('Xóa specialty này?')) return;
    await axiosInstance.delete(`/admin/specialties/${id}`);
    fetchData();
  };

  // --- Render ---
  return (
    <div className="p-4">
      <h1>Admin Dashboard</h1>

      {/* Users */}
      <section>
        <h2>Users</h2>
        <div>
          <input placeholder="Họ tên" value={userForm.fullName} onChange={e => setUserForm({...userForm, fullName: e.target.value})} />
          <input placeholder="Email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
          <input placeholder="Password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
          <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={saveUser}>{editUserId ? 'Cập nhật' : 'Tạo'}</button>
        </div>
        <table border="1" cellPadding={5}>
          <thead>
            <tr>
              <th>Họ tên</th>
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
                  <button onClick={() => editUser(u)}>Edit</button>
                  <button onClick={() => resetPassword(u._id)}>Reset PW</button>
                  <button onClick={() => deleteUser(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Locations */}
      <section>
        <h2>Locations</h2>
        <div>
          <input placeholder="Tên cơ sở y tế" value={locationForm.name} onChange={e => setLocationForm({name: e.target.value})} />
          <button onClick={saveLocation}>{editLocationId ? 'Cập nhật' : 'Tạo'}</button>
        </div>
        <ul>
          {locations.map(l => (
            <li key={l._id}>
              {l.name} <button onClick={() => editLocation(l)}>Edit</button> <button onClick={() => deleteLocation(l._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Specialties */}
      <section>
        <h2>Specialties</h2>
        <div>
          <input placeholder="Tên chuyên khoa" value={specialtyForm.name} onChange={e => setSpecialtyForm({...specialtyForm, name: e.target.value})} />
          <select value={specialtyForm.location} onChange={e => setSpecialtyForm({...specialtyForm, location: e.target.value})}>
            <option value="">Chọn location</option>
            {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <button onClick={saveSpecialty}>{editSpecialtyId ? 'Cập nhật' : 'Tạo'}</button>
        </div>
        <ul>
          {specialties.map(s => (
            <li key={s._id}>
              {s.name} - Location: {s.location?.name || 'N/A'}
              <button onClick={() => editSpecialty(s)}>Edit</button>
              <button onClick={() => deleteSpecialty(s._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminDashboard;
