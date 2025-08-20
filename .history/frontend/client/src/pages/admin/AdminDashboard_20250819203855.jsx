import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  const [formUser, setFormUser] = useState({ fullName: '', email: '', password: '', role: 'patient' });
  const [formDoctor, setFormDoctor] = useState({ user: '', location: '', specialty: '' });
  const [formLocation, setFormLocation] = useState({ name: '', specialties: [] });
  const [formSpecialty, setFormSpecialty] = useState({ name: '', locations: [] });

  // ================= Fetch Data =================
  const fetchAll = async () => {
    try {
      const [usersRes, doctorsRes, locationsRes, specialtiesRes] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/doctors'),
        axios.get('/admin/locations'),
        axios.get('/admin/specialties'),
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
      await axios.post('/admin/users', formUser);
      setFormUser({ fullName: '', email: '', password: '', role: 'patient' });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tạo user');
    }
  };

  const updateUser = async (id) => {
    try {
      await axios.put(`/admin/users/${id}`, formUser);
      setFormUser({ fullName: '', email: '', password: '', role: 'patient' });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật user');
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

  // ================= Doctors =================
  const createDoctor = async () => {
    try {
      await axios.post('/admin/doctors', formDoctor);
      setFormDoctor({ user: '', location: '', specialty: '' });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tạo doctor');
    }
  };

  const updateDoctor = async (id) => {
    try {
      await axios.put(`/admin/doctors/${id}`, formDoctor);
      setFormDoctor({ user: '', location: '', specialty: '' });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật doctor');
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm('Xác nhận xóa doctor?')) return;
    try {
      await axios.delete(`/admin/doctors/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa doctor');
    }
  };

  // ================= Locations =================
  const createLocation = async () => {
    try {
      await axios.post('/admin/locations', formLocation);
      setFormLocation({ name: '', specialties: [] });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tạo location');
    }
  };

  const updateLocation = async (id) => {
    try {
      await axios.put(`/admin/locations/${id}`, formLocation);
      setFormLocation({ name: '', specialties: [] });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật location');
    }
  };

  const deleteLocation = async (id) => {
    if (!window.confirm('Xác nhận xóa location?')) return;
    try {
      await axios.delete(`/admin/locations/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa location');
    }
  };

  // ================= Specialties =================
  const createSpecialty = async () => {
    try {
      await axios.post('/admin/specialties', formSpecialty);
      setFormSpecialty({ name: '', locations: [] });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tạo specialty');
    }
  };

  const updateSpecialty = async (id) => {
    try {
      await axios.put(`/admin/specialties/${id}`, formSpecialty);
      setFormSpecialty({ name: '', locations: [] });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật specialty');
    }
  };

  const deleteSpecialty = async (id) => {
    if (!window.confirm('Xác nhận xóa specialty?')) return;
    try {
      await axios.delete(`/admin/specialties/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa specialty');
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        <button onClick={() => setActiveTab('users')}>Users</button>
        <button onClick={() => setActiveTab('doctors')}>Doctors</button>
        <button onClick={() => setActiveTab('locations')}>Locations</button>
        <button onClick={() => setActiveTab('specialties')}>Specialties</button>
      </div>

      {/* ================= Users ================= */}
      {activeTab === 'users' && (
        <div>
          <h2>Users</h2>
          <div>
            <input placeholder="Full Name" value={formUser.fullName} onChange={e => setFormUser({...formUser, fullName: e.target.value})} />
            <input placeholder="Email" value={formUser.email} onChange={e => setFormUser({...formUser, email: e.target.value})} />
            <input placeholder="Password" type="password" value={formUser.password} onChange={e => setFormUser({...formUser, password: e.target.value})} />
            <select value={formUser.role} onChange={e => setFormUser({...formUser, role: e.target.value})}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={createUser}>Create</button>
          </div>
          <ul>
            {users.map(u => (
              <li key={u._id}>
                {u.fullName} ({u.email}, {u.role})
                <button onClick={() => setFormUser({ fullName: u.fullName, email: u.email, role: u.role, password: '' })}>Edit</button>
                <button onClick={() => updateUser(u._id)}>Save</button>
                <button onClick={() => deleteUser(u._id)}>Delete</button>
                <button onClick={() => resetPassword(u._id)}>Reset Password</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ================= Doctors ================= */}
      {activeTab === 'doctors' && (
        <div>
          <h2>Doctors</h2>
          <div>
            <select value={formDoctor.user} onChange={e => setFormDoctor({...formDoctor, user: e.target.value})}>
              <option value="">Select User</option>
              {users.filter(u => u.role === 'doctor').map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
            </select>
            <select value={formDoctor.location} onChange={e => setFormDoctor({...formDoctor, location: e.target.value})}>
              <option value="">Select Location</option>
              {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
            <select value={formDoctor.specialty} onChange={e => setFormDoctor({...formDoctor, specialty: e.target.value})}>
              <option value="">Select Specialty</option>
              {specialties.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <button onClick={createDoctor}>Create</button>
          </div>
          <ul>
            {doctors.map(d => (
              <li key={d._id}>
                {d.user?.fullName} - {d.location?.name} - {d.specialty?.name}
                <button onClick={() => setFormDoctor({ user: d.user._id, location: d.location._id, specialty: d.specialty._id })}>Edit</button>
                <button onClick={() => updateDoctor(d._id)}>Save</button>
                <button onClick={() => deleteDoctor(d._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ================= Locations ================= */}
      {activeTab === 'locations' && (
        <div>
          <h2>Locations</h2>
          <input placeholder="Name" value={formLocation.name} onChange={e => setFormLocation({...formLocation, name: e.target.value})} />
          <select multiple value={formLocation.specialties} onChange={e => setFormLocation({...formLocation, specialties: Array.from(e.target.selectedOptions, o => o.value)})}>
            {specialties.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <button onClick={createLocation}>Create</button>
          <ul>
            {locations.map(l => (
              <li key={l._id}>
                {l.name} - Specialties: {l.specialties?.map(s => s.name).join(', ')}
                <button onClick={() => setFormLocation({ name: l.name, specialties: l.specialties.map(s => s._id) })}>Edit</button>
                <button onClick={() => updateLocation(l._id)}>Save</button>
                <button onClick={() => deleteLocation(l._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ================= Specialties ================= */}
      {activeTab === 'specialties' && (
        <div>
          <h2>Specialties</h2>
          <input placeholder="Name" value={formSpecialty.name} onChange={e => setFormSpecialty({...formSpecialty, name: e.target.value})} />
          <select multiple value={formSpecialty.locations} onChange={e => setFormSpecialty({...formSpecialty, locations: Array.from(e.target.selectedOptions, o => o.value)})}>
            {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <button onClick={createSpecialty}>Create</button>
          <ul>
            {specialties.map(s => (
              <li key={s._id}>
                {s.name} - Locations: {s.location?.map(l => l.name).join(', ')}
                <button onClick={() => setFormSpecialty({ name: s.name, locations: s.location?.map(l => l._id) || [] })}>Edit</button>
                <button onClick={() => updateSpecialty(s._id)}>Save</button>
                <button onClick={() => deleteSpecialty(s._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
