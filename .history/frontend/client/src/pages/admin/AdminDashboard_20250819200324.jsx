import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [editType, setEditType] = useState(null); // 'user' | 'location' | 'specialty'
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  // ---------------- Fetch data ----------------
  const fetchAll = async () => {
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
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = type => {
    setEditType(type);
    setEditId(null);

    let initial = {};
    if (type === 'user') {
      initial = { fullName: '', email: '', role: 'patient', location: '', specialty: '' };
    }
    if (type === 'location') {
      initial = { name: '', address: '', specialties: [] };
    }
    if (type === 'specialty') {
      initial = { name: '', description: '', locations: [] };
    }
    setForm(initial);
  };

  const handleEdit = (type, item) => {
    setEditType(type);
    setEditId(item._id);
    if (type === 'user') {
      setForm({
        fullName: item.fullName || '',
        email: item.email || '',
        role: item.role || 'patient',
        location: item.location || '',
        specialty: item.specialty || '',
      });
    } else {
      setForm({ ...item });
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Xác nhận xóa?')) return;
    try {
      await axiosInstance.delete(`/admin/${type}s/${id}`);
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleResetPassword = async id => {
    if (!window.confirm('Reset mật khẩu user này?')) return;
    try {
      await axiosInstance.post(`/admin/users/${id}/reset-password`);
      alert('Reset mật khẩu thành công');
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        await axiosInstance.put(`/admin/${editType}s/${editId}`, form);
      } else {
        await axiosInstance.post(`/admin/${editType}s`, form);
      }
      setEditType(null); setEditId(null);
      fetchAll();
    } catch (err) { console.error(err); }
  };

  // ---------------- Table ----------------
  const renderTable = (data, type, columns) => {
    const filtered = data.filter(item => {
      if (!search) return true;
      return columns.some(c => {
        const val = item[c] || '';
        return val.toString().toLowerCase().includes(search.toLowerCase());
      });
    });

    return (
      <div className="admin-section">
        <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
        <div className="table-actions">
          <button onClick={() => handleAdd(type)}>Thêm {type}</button>
          <input placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <table>
          <thead>
            <tr>
              {columns.map(col => <th key={col}>{col}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item._id}>
                {columns.map(col => {
                  let value = item[col] ?? '-';
                  if (col === 'specialty') value = specialties.find(s => s._id === item[col])?.name ?? '-';
                  if (col === 'location') value = locations.find(l => l._id === item[col])?.name ?? '-';
                  if (col === 'locations') value = item[col]?.map(id => locations.find(l => l._id === id)?.name).join(', ') ?? '-';
                  return <td key={col}>{value}</td>;
                })}
                <td>
                  <button onClick={() => handleEdit(type, item)}>Sửa</button>
                  <button onClick={() => handleDelete(type, item._id)}>Xóa</button>
                  {type === 'user' && <button onClick={() => handleResetPassword(item._id)}>Reset PW</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ---------------- Form ----------------
  const renderForm = () => {
    if (!editType) return null;

    return (
      <div className="admin-form card">
        <h3>{editId ? 'Sửa' : 'Thêm'} {editType}</h3>
        <form onSubmit={handleSubmit}>
          {editType === 'user' && (
            <>
              <div>
                <label>Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} required />
              </div>
              <div>
                <label>Email</label>
                <input name="email" value={form.email} onChange={handleChange} type="email" required />
              </div>
              <div>
                <label>Role</label>
                <select name="role" value={form.role} onChange={handleChange} required>
                  <option value="admin">admin</option>
                  <option value="doctor">doctor</option>
                  <option value="patient">patient</option>
                </select>
              </div>
              {form.role === 'doctor' && (
                <>
                  <div>
                    <label>Location</label>
                    <select name="location" value={form.location} onChange={handleChange} required>
                      <option value="">Chọn cơ sở</option>
                      {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Specialty</label>
                    <select name="specialty" value={form.specialty || ''} onChange={handleChange} required>
                      <option value="">Chọn chuyên khoa</option>
                      {specialties
                        .filter(s => form.location && Array.isArray(s.locations) && s.locations.includes(form.location))
                        .map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          {editType === 'location' && (
            <>
              <div>
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label>Address</label>
                <input name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div>
                <label>Specialties</label>
                <select multiple name="specialties" value={form.specialties || []} onChange={e => {
                  const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                  setForm({ ...form, specialties: selected });
                }}>
                  {specialties.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </>
          )}

          {editType === 'specialty' && (
            <>
              <div>
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label>Description</label>
                <input name="description" value={form.description} onChange={handleChange} />
              </div>
              <div>
                <label>Locations</label>
                <select multiple name="locations" value={form.locations || []} onChange={e => {
                  const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                  setForm({ ...form, locations: selected });
                }}>
                  {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                </select>
              </div>
            </>
          )}

          <button type="submit">{editId ? 'Cập nhật' : 'Thêm'}</button>
          <button type="button" onClick={() => { setEditType(null); setEditId(null); }}>Hủy</button>
        </form>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {renderTable(users, 'user', ['fullName', 'email', 'role', 'location', 'specialty'])}
      {renderTable(locations, 'location', ['name', 'address', 'specialties'])}
      {renderTable(specialties, 'specialty', ['name', 'description', 'locations'])}
      {renderForm()}
    </div>
  );
};

export default AdminDashboard;
