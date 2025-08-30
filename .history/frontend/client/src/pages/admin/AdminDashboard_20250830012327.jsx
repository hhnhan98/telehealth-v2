// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Modal from '../../components/ui/Modal';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [editType, setEditType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');
  const [newSpecialtyName, setNewSpecialtyName] = useState('');

  // ===== Fetch all data =====
  const fetchAll = async () => {
    try {
      const [uRes, dRes, lRes, sRes] = await Promise.all([
        axiosInstance.get('/admin/users'),
        axiosInstance.get('/admin/doctors'),
        axiosInstance.get('/admin/locations'),
        axiosInstance.get('/admin/specialties'),
        axiosInstance.get('/admin/statistics')
      ]);
      setUsers(uRes.data.data || []);
      setDoctors(dRes.data.data || []);
      setLocations(lRes.data.data || []);
      setSpecialties(sRes.data.data || []);
      setStats(statsRes.data || {});
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ===== Helpers =====
  const pluralize = type => type === 'specialty' ? 'specialties' : type + 's';

  const handleChange = async e => {
    const { name, value } = e.target;

    // Validate specialty-location
    if (name === 'specialty' && form?.location) {
      const selectedSpecialty = specialties.find(s => s._id === value);
      if (selectedSpecialty && selectedSpecialty.location?._id !== form.location) {
        alert('Specialty này không thuộc Location đã chọn!');
        return;
      }
    }

    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'location' ? { specialty: '' } : {})
    }));

    if (name === 'location' && value) {
      try {
        const res = await axiosInstance.get(`/admin/specialties?location=${value}`);
        setSpecialties(res.data.data || []);
      } catch (err) {
        console.error('Lỗi fetch specialties theo location:', err);
        setSpecialties([]);
      }
    }
  };

  const handleAdd = type => {
    setEditType(type);
    setEditId(null);
    const fields = formFields[type].reduce((acc, f) => {
      acc[f.key] = f.type === 'multiselect' ? [] : '';
      return acc;
    }, { role: '' });
    setForm(fields);
  };

  const handleEdit = (type, item) => {
    if (!item) return;
    setEditType(type);
    setEditId(item._id);

    if (type === 'location') {
      setForm({ name: item.name || '', address: item.address || '' });
    } else if (type === 'user' || type === 'doctor') {
      const copy = { ...item };
      if (copy.user && typeof copy.user === 'object') copy.user = copy.user._id;
      if (copy.location && typeof copy.location === 'object') copy.location = copy.location._id;
      if (copy.specialty && typeof copy.specialty === 'object') copy.specialty = copy.specialty._id;
      if (!copy.role) copy.role = '';
      setForm(copy);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Xác nhận xóa?')) return;
    try {
      await axiosInstance.delete(`/admin/${pluralize(type)}/${id}`);
      if (type === 'user') setUsers(prev => prev.filter(u => u && u._id !== id));
      if (type === 'doctor') setDoctors(prev => prev.filter(d => d && d._id !== id));
      if (type === 'location') setLocations(prev => prev.filter(l => l && l._id !== id));
      if (type === 'specialty') setSpecialties(prev => prev.filter(s => s && s._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleResetPassword = async userId => {
    if (!window.confirm('Reset mật khẩu user này?')) return;
    try {
      await axiosInstance.post(`/admin/users/${userId}/reset-password`);
      alert('Reset mật khẩu thành công');
    } catch (err) { console.error(err); }
  };

  // ===== Submit form =====
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const endpoint = editId
        ? `/admin/${pluralize(editType)}/${editId}`
        : `/admin/${pluralize(editType)}`;
      const res = editId
        ? await axiosInstance.put(endpoint, form)
        : await axiosInstance.post(endpoint, form);

      const data = res.data.data;

      if (editType === 'user') setUsers(prev => editId ? prev.map(u => u._id === editId ? data.user : u) : [...prev, data.user]);
      if (editType === 'doctor') setDoctors(prev => editId ? prev.map(d => d._id === editId ? data : d) : [...prev, data]);
      if (editType === 'location') setLocations(prev => editId ? prev.map(l => l._id === editId ? data : l) : [...prev, data]);
      if (editType === 'specialty') setSpecialties(prev => editId ? prev.map(s => s._id === editId ? data : s) : [...prev, data]);

      setEditType(null);
      setEditId(null);
      setForm({});
      setNewSpecialtyName('');
    } catch (err) { console.error(err); }
  };

  // ===== Add/Remove specialty for location =====
  const handleAddSpecialty = async () => {
    if (!newSpecialtyName.trim()) return alert('Nhập tên Specialty!');
    try {
      const res = await axiosInstance.post('/admin/specialties', {
        name: newSpecialtyName,
        location: editId
      });
      setSpecialties(prev => [...prev, res.data.data]);
      setNewSpecialtyName('');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi thêm Specialty');
      console.error(err);
    }
  };

  const handleRemoveSpecialty = async (specialtyId) => {
    if (!window.confirm('Xác nhận xóa specialty khỏi location?')) return;
    try {
      await axiosInstance.delete(`/admin/specialties/${specialtyId}`);
      setSpecialties(prev => prev.filter(s => s && s._id !== specialtyId));
    } catch (err) {
      console.error(err);
      alert('Xóa specialty thất bại');
    }
  };

  // ===== Form fields =====
  const formFields = {
    user: [
      { key: 'fullName', type: 'text' },
      { key: 'email', type: 'email' },
      { key: 'role', type: 'select', options: ['admin','doctor','patient'] },
      { key: 'location', type: 'select', options: locations.filter(l => l).map(l => ({ label: l.name, value: l._id })), dependsOn: 'doctor' },
      { key: 'specialty', type: 'select', options: specialties.filter(s => s).map(s => ({ label: s.name, value: s._id })), dependsOn: 'doctor' },
    ],
    doctor: [
      { key: 'user', type: 'select', 
        options: users
          .filter(u => u && u.role==='doctor')
          .map(u => ({label:u.fullName || '-', value:u._id}))
      },
      { key: 'location', type: 'select', options: locations.filter(l => l).map(l => ({label:l.name,value:l._id})) },
      { key: 'specialty', type: 'select', options: specialties.filter(s => s).map(s => ({label:s.name,value:s._id})) },
    ],
    location: [
      { key: 'name', type: 'text' },
      { key: 'address', type: 'text' },
    ],
  };

  // ===== Render Table =====
  const renderTable = (data, type, columns) => {
    const filtered = (data || []).filter(item =>
      item && (!search || columns.some(c => {
        const val = item[c];
        if (!val) return false;
        if (typeof val === 'object') return val.name?.toLowerCase().includes(search.toLowerCase()) || val.fullName?.toLowerCase().includes(search.toLowerCase());
        return val.toString().toLowerCase().includes(search.toLowerCase());
      }))
    );

    return (
      <div className="admin-section">
        <h3>{type.charAt(0).toUpperCase()+type.slice(1)}</h3>
        <div className="table-actions">
          <button onClick={()=>handleAdd(type)}>Thêm {type}</button>
          <input placeholder="Tìm kiếm..." value={search} onChange={e=>setSearch(e.target.value)} />
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
              if (!item) return null;
              return (
                <tr key={item._id}>
                  {columns.map(col => {
                    let value = '-';
                    if(col==='user') value = item.user?.fullName || '-';
                    else if(col==='location') value = item.location?.name || '-';
                    else if(col==='specialty') value = item.specialty?.name || '-';
                    else if(col==='specialties') {
                      const attached = specialties.filter(s => s.location?._id === item._id);
                      value = attached.map(s => s.name).join(', ') || '-';
                    }
                    else value = item[col] ?? '-';
                    return <td key={col}>{value}</td>;
                  })}
                  <td>
                    <button onClick={()=>handleEdit(type,item)}>Sửa</button>
                    <button onClick={()=>handleDelete(type,item._id)}>Xóa</button>
                    {type==='user' && <button onClick={()=>handleResetPassword(item._id)}>Reset PW</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="admin-stats" style={{display:'flex',gap:20,marginBottom:20,flexWrap:'wrap'}}>
  <div className="stat-card">Users: {stats.totalUsers}</div>
  <div className="stat-card">Doctors: {stats.totalDoctors}</div>
  <div className="stat-card">Patients: {stats.totalPatients}</div>
  <div className="stat-card">Locations: {stats.totalLocations}</div>
  <div className="stat-card">Specialties: {stats.totalSpecialties}</div>
  <div className="stat-card">Schedules: {stats.totalSchedules}</div>
  <div className="stat-card">Appointments: {stats.totalAppointments}</div>
  <div className="stat-card">MedicalRecords: {stats.totalMedicalRecords}</div>
</div>


      {renderTable(users,'user',['fullName','email','role','location','specialty'])}
      {renderTable(doctors,'doctor',['user','specialty','location'])}
      {renderTable(locations,'location',['name','address','specialties'])}

      {/* ===== Modal Form ===== */}
      <Modal
        isOpen={!!editType && editType!=='specialty'}
        title={`${editId ? 'Sửa' : 'Thêm'} ${editType}`}
        onClose={()=>{ setEditType(null); setEditId(null); setForm({}); setNewSpecialtyName(''); }}
        size="medium"
      >
        <form onSubmit={handleSubmit}>
          {editType && formFields[editType].map(f=>{
            if(f.dependsOn && (form?.role || '') !== f.dependsOn) return null;
            if(['text','email'].includes(f.type)) return (
              <div key={f.key}>
                <label>{f.key}</label>
                <input name={f.key} type={f.type} value={form[f.key]||''} onChange={handleChange} required/>
              </div>
            );
            if(f.type==='select') {
              const options = (editType==='doctor' && f.key==='specialty' && form.location)
                ? specialties.filter(s => s.location?._id === form.location)
                : f.options || [];

              return (
                <div key={f.key}>
                  <label>{f.key}</label>
                  <select name={f.key} value={form[f.key]||''} onChange={handleChange} required>
                    <option value=''>Chọn {f.key}</option>
                    {options.map((opt, idx) => 
                      !opt ? null :
                      (typeof opt==='string'
                        ? <option key={`${opt}-${idx}`} value={opt}>{opt}</option>
                        : <option key={opt.key || `${opt.value}-${idx}`} value={opt.value}>{opt.label}</option>
                      )
                    )}
                  </select>
                </div>
              );
            }
            return null;
          })}

          {/* Specialty management inside Location modal */}
          {editType==='location' && editId && (
            <>
              <div style={{marginTop:15}}>
                <h4 style={{marginBottom:10}}>Specialties hiện có</h4>
                <div style={{display:'flex',flexWrap:'wrap',gap:8,maxHeight:150,overflowY:'auto'}}>
                  {specialties.filter(s=>s.location?._id===editId).map(s=>(
                    <div key={s._id} style={{display:'flex',alignItems:'center',background:'#dce4e6',padding:'5px 10px',borderRadius:20,gap:5}}>
                      <span>{s.name}</span>
                      <button type="button" onClick={()=>handleRemoveSpecialty(s._id)} style={{background:'transparent',border:'none',color:'#ff4d4f',cursor:'pointer',fontWeight:'bold',fontSize:14,lineHeight:1}} title="Xóa specialty">×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{marginTop:15,display:'flex',gap:10,alignItems:'center'}}>
                <input style={{flex:1,padding:'6px 10px',borderRadius:4,border:'1px solid #ccc'}} value={newSpecialtyName} onChange={e=>setNewSpecialtyName(e.target.value)} placeholder="Nhập tên chuyên khoa mới" onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); handleAddSpecialty(); } }}/>
                <button type="button" onClick={handleAddSpecialty} style={{padding:'6px 15px',borderRadius:4,border:'none',backgroundColor:'#1890ff',color:'white',cursor:'pointer'}}>Thêm</button>
              </div>
            </>
          )}

          <div style={{marginTop:15,display:'flex',gap:10}}>
            <button type="submit">{editId?'Cập nhật':'Thêm'}</button>
            <button type="button" onClick={()=>{ setEditType(null); setEditId(null); setForm({}); setNewSpecialtyName(''); }}>Hủy</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
