import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [editType, setEditType] = useState(null); // 'user' | 'location' | 'specialty'
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});

  const formFields = {
    user: ['fullName', 'email', 'role'],
    location: ['name', 'address'],
    specialty: ['name', 'description'],
  };

  // Lấy dữ liệu
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

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = type => {
    setEditType(type);
    setEditId(null);
    setForm(formFields[type].reduce((acc, key) => ({ ...acc, [key]: '' }), {}));
  };

  const handleEdit = (type, item) => {
    setEditType(type);
    setEditId(item._id);
    setForm({ ...item });
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Xác nhận xóa?')) return;
    try {
      await axiosInstance.delete(`/admin/${type}s/${id}`);
      // Cập nhật state cục bộ
      if (type === 'user') setUsers(prev => prev.filter(u => u._id !== id));
      else if (type === 'location') setLocations(prev => prev.filter(l => l._id !== id));
      else if (type === 'specialty') setSpecialties(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        await axiosInstance.put(`/admin/${editType}s/${editId}`, form);
      } else {
        await axiosInstance.post(`/admin/${editType}s`, form);
      }
      setEditType(null);
      setEditId(null);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const renderTable = (data, type, columns) => (
    <div className="admin-section">
      <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
      <button onClick={() => handleAdd(type)}>Thêm {type}</button>
      <table>
        <thead>
          <tr>
            {columns.map(col => <th key={col}>{col}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item._id}>
              {columns.map(col => <td key={col}>{item[col] ?? '-'}</td>)}
              <td>
                <button onClick={() => handleEdit(type, item)}>Sửa</button>
                <button onClick={() => handleDelete(type, item._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {renderTable(users, 'user', ['fullName','email','role'])}
      {renderTable(locations, 'location', ['name','address'])}
      {renderTable(specialties, 'specialty', ['name','description'])}

      {editType && (
        <div className="admin-form card">
          <h3>{editId ? 'Sửa' : 'Thêm'} {editType}</h3>
          <form onSubmit={handleSubmit}>
            {formFields[editType].map(key => (
              <div key={key}>
                <label>{key}</label>
                <input
                  name={key}
                  value={form[key] || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
            <button type="submit">{editId ? 'Cập nhật' : 'Thêm'}</button>
            <button type="button" onClick={() => { setEditType(null); setEditId(null); }}>Hủy</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
