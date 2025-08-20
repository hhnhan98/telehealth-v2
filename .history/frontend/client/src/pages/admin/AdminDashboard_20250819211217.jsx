import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [editType, setEditType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  // --- Fetch all data ---
  const fetchAll = async () => {
    try {
      const [uRes, lRes, sRes] = await Promise.all([
        axiosInstance.get('/admin/users'),
        axiosInstance.get('/admin/locations'),
        axiosInstance.get('/admin/specialties'),
      ]);
      setUsers(uRes.data.data || []);
      setLocations(lRes.data.data || []);
      setSpecialties(sRes.data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAll(); }, []);

  // --- Helpers ---
  const pluralize = type => {
    if (type === 'specialty') return 'specialties';
    if (type === 'location') return 'locations';
    if (type === 'user') return 'users';
    return type + 's';
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

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
    if (type === 'location') {
      const attached = specialties.filter(s => Array.isArray(s.locations) && s.locations.includes(item._id)).map(s => s._id);
      setForm({ ...item, specialties: attached });
    } else if (type === 'specialty') {
      const attached = locations.filter(l => Array.isArray(item.locations) && item.locations.includes(l._id)).map(l => l._id);
      setForm({ ...item, locations: attached });
    } else setForm({ ...item });
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Xác nhận xóa?')) return;
    try {
      await axiosInstance.delete(`/admin/${pluralize(type)}/${id}`);
      if (type === 'user') setUsers(prev => prev.filter(u => u._id !== id));
      if (type === 'location') setLocations(prev => prev.filter(l => l._id !== id));
      if (type === 'specialty') setSpecialties(prev => prev.filter(s => s._id !== id));
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
      const endpoint = editId
        ? `/admin/${pluralize(editType)}/${editId}`
        : `/admin/${pluralize(editType)}`;

      // Send request
      let res;
      if (editId) res = await axiosInstance.put(endpoint, form);
      else res = await axiosInstance.post(endpoint, form);

      // Update state locally
      const data = res.data.data;
      if (editType === 'user') {
        setUsers(prev => editId ? prev.map(u => u._id === editId ? data : u) : [...prev, data]);
      } else if (editType === 'location') {
        setLocations(prev => editId ? prev.map(l => l._id === editId ? data : l) : [...prev, data]);
      } else if (editType === 'specialty') {
        setSpecialties(prev => editId ? prev.map(s => s._id === editId ? data : s) : [...prev, data]);
      }

      setEditType(null);
      setEditId(null);
      setForm({});
    } catch (err) { console.error(err); }
  };

  // --- Form fields ---
  const formFields = {
    user: [
      { key: 'fullName', type: 'text' },
      { key: 'email', type: 'email' },
      { key: 'role', type: 'select', options: ['admin', 'doctor', 'patient'] },
      { key: 'location', type: 'select', options: locations.map(l => ({ label: l.name, value: l._id })), dependsOn: 'doctor' },
      { key: 'specialty', type: 'select', options: specialties.map(s => ({ label: s.name, value: s._id })), dependsOn: 'doctor' },
    ],
    location: [
      { key: 'name', type: 'text' },
      { key: 'address', type: 'text' },
      { key: 'specialties', type: 'multiselect', options: specialties.map(s => ({ label: s.name, value: s._id })) },
    ],
    specialty: [
      { key: 'name', type: 'text' },
      { key: 'description', type: 'text' },
      { key: 'locations', type: 'multiselect', options: locations.map(l => ({ label: l.name, value: l._id })) },
    ]
  };

  // --- Render Table ---
  const renderTable = (data, type, columns) => {
    const filtered = data.filter(item =>
      !search || columns.some(c => (item[c]?.toString().toLowerCase().includes(search.toLowerCase())))
    );

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
            {filtered.map(item => {
              return (
                <tr key={item._id}>
                  {columns.map(col => {
                    let value = item[col] ?? '-';
                    if (col === 'specialty') value = specialties.find(s => s._id === item[col])?.name ?? '-';
                    if (col === 'location') value = locations.find(l => l._id === item[col])?.name ?? '-';
                    if (col === 'locations' || col === 'specialties') value = (Array.isArray(item[col]) ? item[col] : [])
                      .map(id => {
                        const s = specialties.find(s => s._id === id);
                        const l = locations.find(l => l._id === id);
                        return s ? s.name : l ? l.name : '';
                      }).join(', ') || '-';
                    return <td key={col}>{value}</td>;
                  })}
                  <td>
                    <button onClick={() => handleEdit(type, item)}>Sửa</button>
                    <button onClick={() => handleDelete(type, item._id)}>Xóa</button>
                    {type === 'user' && <button onClick={() => handleResetPassword(item._id)}>Reset PW</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // --- Render Form ---
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
                  <input name={f.key} type={f.type} value={form[f.key] || ''} onChange={handleChange} required />
                </div>
              );
            }

            if (f.type === 'select') {
              return (
                <div key={f.key}>
                  <label>{f.key}</label>
                  <select name={f.key} value={form[f.key] || ''} onChange={handleChange} required>
                    <option value=''>Chọn {f.key}</option>
                    {f.options.map(opt =>
                      typeof opt === 'string'
                        ? <option key={opt} value={opt}>{opt}</option>
                        : <option key={opt.value} value={opt.value}>{opt.label}</option>
                    )}
                  </select>
                </div>
              );
            }

            if (f.type === 'multiselect') {
              return (
                <div key={f.key}>
                  <label>{f.key}</label>
                  <select multiple name={f.key} value={form[f.key] || []} onChange={e => {
                    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                    setForm({ ...form, [f.key]: selected });
                  }}>
                    {f.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              );
            }

            return null;
          })}

          <button type="submit">{editId ? 'Cập nhật' : 'Thêm'}</button>
          <button type="button" onClick={() => { setEditType(null); setEditId(null); setForm({}); }}>Hủy</button>
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
