import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [form, setForm] = useState({}); // dùng cho Add/Edit
  const [editType, setEditType] = useState(null); // 'user' | 'location' | 'specialty'
  const [editId, setEditId] = useState(null);

  const fetchAll = async () => {
    try {
      const [uRes, lRes, sRes] = await Promise.all([
        axiosInstance.get('/api/admin/users'),
        axiosInstance.get('/api/admin/locations'),
        axiosInstance.get('/api/admin/specialties'),
      ]);
      setUsers(uRes.data.data);
      setLocations(lRes.data.data);
      setSpecialties(sRes.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (type) => {
    setEditType(type);
    setEditId(null);
    setForm({});
  };

  const handleEdit = (type, item) => {
    setEditType(type);
    setEditId(item._id);
    setForm(item);
  };

  const handleDelete = async (type, id) => {
    if(!window.confirm('Xác nhận xóa?')) return;
    try {
      await axiosInstance.delete(`/api/admin/${type}s/${id}`);
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if(editId) {
        await axiosInstance.put(`/api/admin/${editType}s/${editId}`, form);
      } else {
        await axiosInstance.post(`/api/admin/${editType}s`, form);
      }
      setEditId(null);
      setEditType(null);
      fetchAll();
    } catch (err) { console.error(err); }
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
              {columns.map(col => <td key={col}>{item[col] || item[col.toLowerCase()]}</td>)}
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
            {Object.keys(form).map(key => (
              <div key={key}>
                <label>{key}</label>
                <input name={key} value={form[key]} onChange={handleChange} />
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
