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

  // --- Fetch dữ liệu ---
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
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = e => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      const values = Array.from(selectedOptions).map(o => o.value);
      setForm({ ...form, [name]: values });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAdd = type => {
    setEditType(type);
    setEditId(null);
    const fields = formFields[type].reduce((acc, f) => {
      acc[f.key] = f.type === 'multiselect' ? [] : '';
      return acc;
    }, {});
    setForm(fields);
  };

  const handleEdit = (type, item) => {
    setEditType(type);
    setEditId(item._id);
    const initForm = { ...item };
    // đảm bảo multi-select luôn là array
    if (type === 'location') initForm.specialties = item.specialties || [];
    if (type === 'specialty') initForm.locations = item.locations || [];
    if (type === 'user' && item.role === 'doctor') {
      initForm.specialty = item.specialty || '';
      initForm.location = item.location || '';
    }
    setForm(initForm);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Xác nhận xóa?')) return;
    try {
      await axiosInstance.delete(`/admin/${type}s/${id}`);
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleResetPassword = async userId => {
    if (!window.confirm('Reset mật khẩu user này?')) return;
    try {
      await axiosInstance.post(`/admin/users/${userId}/reset-password`);
      alert('Reset mật khẩu thành công');
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      let dataToSend = { ...form };
      // đảm bảo multi-select luôn là array
      if (editType === 'location') dataToSend.specialties = form.specialties || [];
      if (editType === 'specialty') dataToSend.locations = form.locations || [];
      if (editType === 'user' && form.role === 'doctor') {
        dataToSend.location = form.location || '';
        dataToSend.specialty = form.specialty || '';
      }

      if (editId) {
        await axiosInstance.put(`/admin/${editType}s/${editId}`, dataToSend);
      } else {
        await axiosInstance.post(`/admin/${editType}s`, dataToSend);
      }
      setEditType(null);
      setEditId(null);
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const formFields = {
    user: [
      { key: 'fullName', type: 'text' },
      { key: 'email', type: 'email' },
      { key: 'role', type: 'select', options: ['admin', 'doctor', 'patient'] },
      { key: 'location', type: 'select', options: locations.map(l => ({ label: l.name, value: l._id })), dependsOn: 'doctor' },
      { key: 'specialty', type: 'select', options: specialties.map(s => ({ label: s.name, value: s._id })), dependsOn: 'doctor' }
    ],
    location: [
      { key: 'name', type: 'text' },
      { key: 'address', type: 'text' },
      { key: 'specialties', type: 'multiselect', options: specialties.map(s => ({ label: s.name, value: s._id })) }
    ],
    specialty: [
      { key: 'name', type: 'text' },
      { key: 'description', type: 'text' },
      { key: 'locations', type: 'multiselect', options: locations.map(l => ({ label: l.name, value: l._id })) }
    ]
  };

  const renderTable = (data, type, columns) => {
    const filtered = data.filter(item => {
      if (!search) return true;
      return columns.some(c => (item[c]?.toString().toLowerCase().includes(search.toLowerCase())));
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
                  if (col === 'locations') value = (item[col] || []).map(id => locations.find(l => l._id === id)?.name).join(', ') ?? '-';
                  if (col === 'specialties') value = (item[col] || []).map(id => specialties.find(s => s._id === id)?.name).join(', ') ?? '-';
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

  const renderForm = () => {
    if (!editType) return null;
    return (
      <div className="admin-form card">
        <h3>{editId ? 'Sửa' : 'Thêm'} {editType}</h3>
        <form onSubmit={handleSubmit}>
          {formFields[editType].map(f => {
            if (f.dependsOn && form.role !== f.dependsOn) return null;

            if (f.type === 'text' || f.type === 'email') {
              return (
                <div key={f.key}>
                  <label>{f.key}</label>
                  <input
                    name={f.key}
                    type={f.type}
                    value={form[f.key] || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
              );
            }

            if (f.type === 'select') {
              // specialty filter theo location
              let options = f.options;
              if (f.key === 'specialty' && form.role === 'doctor' && form.location) {
                options = specialties.filter(s => Array.isArray(s.locations) && s.locations.includes(form.location))
                  .map(s => ({ label: s.name, value: s._id }));
              }

              return (
                <div key={f.key}>
                  <label>{f.key}</label>
                  <select
                    name={f.key}
                    value={form[f.key] || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value=''>Chọn {f.key}</option>
                    {options.map(opt =>
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    )}
                  </select>
                </div>
              );
            }

            if (f.type === 'multiselect') {
              return (
                <div key={f.key}>
                  <label>{f.key}</label>
                  <select
                    multiple
                    name={f.key}
                    value={form[f.key] || []}
                    onChange={handleChange}
                  >
                    {f.options.map(opt =>
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    )}
                  </select>
                </div>
              );
            }

            return null;
          })}
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
      {renderTable(specialties, 'specialty', ['name', 'description', 'locations'])}
      {renderTable(locations, 'location', ['name', 'address', 'specialties'])}
      {renderForm()}
    </div>
  );
};

export default AdminDashboard;
