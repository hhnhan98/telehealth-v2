// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
//import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'user' | 'location' | 'specialty'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchAll = async () => {
    try {
      const [usersRes, locRes, specRes] = await Promise.all([
        axiosInstance.get('/api/admin/users'),
        axiosInstance.get('/api/admin/locations'),
        axiosInstance.get('/api/admin/specialties'),
      ]);
      setUsers(usersRes.data.data || []);
      setLocations(locRes.data.data || []);
      setSpecialties(specRes.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Lỗi load dữ liệu admin');
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || {});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({});
    setModalType(null);
  };

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axiosInstance.put(`/api/admin/${modalType}s/${editingItem._id}`, formData);
      } else {
        await axiosInstance.post(`/api/admin/${modalType}s`, formData);
      }
      closeModal();
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu dữ liệu');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Xác nhận xóa?')) return;
    try {
      await axiosInstance.delete(`/api/admin/${type}s/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Lỗi xóa dữ liệu');
    }
  };

  const renderTable = (data, type, columns) => (
    <div className="admin-section card">
      <div className="admin-section-header">
        <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
        <button className="btn-add" onClick={() => openModal(type)}>Thêm {type}</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map(col => <th key={col}>{col}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: 'center' }}>Không có dữ liệu</td>
            </tr>
          ) : (
            data.map(item => (
              <tr key={item._id}>
                {columns.map(col => <td key={col}>{item[col] ?? item[col.toLowerCase()]}</td>)}
                <td>
                  <button className="btn-edit" onClick={() => openModal(type, item)}>Sửa</button>
                  <button className="btn-delete" onClick={() => handleDelete(type, item._id)}>Xóa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {renderTable(users, 'user', ['fullName', 'email', 'role'])}
      {renderTable(locations, 'location', ['name', 'address'])}
      {renderTable(specialties, 'specialty', ['name', 'description'])}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editingItem ? 'Sửa' : 'Thêm'} {modalType}</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              {modalType === 'user' && (
                <>
                  <label>Họ tên</label>
                  <input name="fullName" value={formData.fullName || ''} onChange={handleChange} required />

                  <label>Email</label>
                  <input name="email" type="email" value={formData.email || ''} onChange={handleChange} required />

                  <label>Vai trò</label>
                  <select name="role" value={formData.role || 'patient'} onChange={handleChange} required>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                  </select>
                </>
              )}

              {modalType === 'location' && (
                <>
                  <label>Tên cơ sở</label>
                  <input name="name" value={formData.name || ''} onChange={handleChange} required />

                  <label>Địa chỉ</label>
                  <input name="address" value={formData.address || ''} onChange={handleChange} required />
                </>
              )}

              {modalType === 'specialty' && (
                <>
                  <label>Tên chuyên khoa</label>
                  <input name="name" value={formData.name || ''} onChange={handleChange} required />

                  <label>Mô tả</label>
                  <textarea name="description" value={formData.description || ''} onChange={handleChange} />
                </>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn-submit">{editingItem ? 'Cập nhật' : 'Thêm'}</button>
                <button type="button" className="btn-cancel" onClick={closeModal}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
