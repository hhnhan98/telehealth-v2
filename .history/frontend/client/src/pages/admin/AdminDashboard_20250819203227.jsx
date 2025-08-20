import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);

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
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetPassword = async (id) => {
    if (window.confirm('Reset mật khẩu user này về 123456?')) {
      await axiosInstance.post(`/admin/users/${id}/reset-password`);
      alert('Reset thành công!');
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Xóa user này?')) {
      await axiosInstance.delete(`/admin/users/${id}`);
      fetchData();
    }
  };

  return (
    <div className="p-4">
      <h2>Users</h2>
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
                <button onClick={() => resetPassword(u._id)}>Reset PW</button>
                <button onClick={() => deleteUser(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Locations</h2>
      <ul>
        {locations.map(l => <li key={l._id}>{l.name}</li>)}
      </ul>

      <h2>Specialties</h2>
      <ul>
        {specialties.map(s => (
          <li key={s._id}>{s.name} - Location: {s.location?.name || 'N/A'}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
