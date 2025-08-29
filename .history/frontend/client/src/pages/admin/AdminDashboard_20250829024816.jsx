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
        axiosInstance.get('/admin/specialties')
      ]);
      setUsers(uRes.data.data || []);
      setDoctors(dRes.data.data || []);
      setLocations(lRes.data.data || []);
      setSpecialties(sRes.data.data || []);
    } catch (err) { console.error(err); }
  };
  useEffect(() => { fetchAll(); }, []);

  // ===== Helpers =====
  const pluralize = type => type === 'specialty' ? 'specialties' : type + 's';
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = type => {
    setEditType(type);
    setEditId(null);
    const fields = formFields[type].reduce((acc, f) => {
      acc[f.key] = '';
      return acc;
    }, {});
    setForm(fields);
  };

  const handleEdit = (type, item) => {
    setEditType(type);
    setEditId(item._id);
    if (type === 'location') {
      setForm({ name: item.name, address: item.address });
    } else if (type === 'user' || type === 'doctor') {
      const copy = { ...item };
      if (copy.user && typeof copy.user === 'object') copy.user = copy.user._id;
      if (copy.location && typeof copy.location === 'object') copy.location = copy.location._id;
      if (copy.specialty && typeof copy.specialty === 'object') copy.specialty = copy.specialty._id;
      setForm(copy);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Xác nhận xóa?')) return;
    try {
      await axiosInstance.delete(`/admin/${pluralize(type)}/${id}`);
      if (type === 'user') setUsers(prev => prev.filter(u => u._id !== id));
      if (type === 'doctor') setDoctors(prev => prev.filter(d => d._id !== id));
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

  // ===== Submit location form (name + address) =====
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

      setEditType(null);
      setEditId(null);
      setForm({});
      setNewSpecialtyName('');
    } catch (err) { console.error(err); }
  };

  // ===== Add specialty to location from modal =====
  const handleAddSpecialty = async () => {
    if (!newSpecialtyName.trim()) return alert('Nhập tên Specialty!');
    try {
      const res = await axiosInstance.post('/admin/specialties', {
        name: newSpecialtyName,
        location: editId
      });
      const added = res.data.data;
      setSpecialties(prev => [...prev, added]);
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
      setSpecialties(prev => prev.filter(s => s._id !== specialtyId));
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
      { key: 'location', type: 'select', options: locations.map(l => ({ label: l.name, value: l._id })), dependsOn: 'doctor' },
      { key: 'specialty', type: 'select', options: specialties.map(s => ({ label: s.name, value: s._id })), dependsOn: 'doctor' },
    ],
    doctor: [
      { key: 'user', type: 'select', options: users.filter(u => u.role==='doctor').map(u=>({label:u.fullName,value:u._id})) },
      { key: 'location', type: 'select', options: locations.map(l=>({label:l.name,value:l._id})) },
      { key: 'specialty', type: 'select', options: specialties.map(s=>({label:s.name,value:s._id})) },
    ],
    location: [
      { key: 'name', type: 'text' },
      { key: 'address', type: 'text' },
    ]
  };

  // ===== Render Table =====
  const renderTable = (data, type, columns) => {
    const filtered = data.filter(item =>
      !search || columns.some(c => {
        const val = item[c];
        if (!val) return false;
        if (typeof val === 'object') return val.name?.toLowerCase().includes(search.toLowerCase()) || val.fullName?.toLowerCase().includes(search.toLowerCase());
        return val.toString().toLowerCase().includes(search.toLowerCase());
      })
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
            {filtered.map(item=>(
              <tr key={item._id}>
                {columns.map(col=>{
                  let value = item[col] ?? '-';
                  if(col==='user') value=item.user?.fullName||'-';
                  if(col==='location') value=item.location?.name||'-';
                  if(col==='specialty') value=item.specialty?.name||'-';
                  if(col==='specialties') {
                    const attached = specialties.filter(s => s.location?._id === item._id);
                    value = attached.map(s => s.name).join(', ') || '-';
                  }
                  return <td key={col}>{value}</td>;
                })}
                <td>
                  <button onClick={()=>handleEdit(type,item)}>Sửa</button>
                  <button onClick={()=>handleDelete(type,item._id)}>Xóa</button>
                  {type==='user' && <button onClick={()=>handleResetPassword(item._id)}>Reset PW</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
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
            if(f.dependsOn && form.role!==f.dependsOn) return null;
            if(['text','email'].includes(f.type)) return (
              <div key={f.key}>
                <label>{f.key}</label>
                <input name={f.key} type={f.type} value={form[f.key]||''} onChange={handleChange} required/>
              </div>
            );
            if(f.type==='select') return (
              <div key={f.key}>
                <label>{f.key}</label>
                <select name={f.key} value={form[f.key]||''} onChange={handleChange} required>
                  <option value=''>Chọn {f.key}</option>
                  {f.options.map(opt=>typeof opt==='string'?<option key={opt} value={opt}>{opt}</option>:<option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            );
            return null;
          })}

          {/* ===== Specialty management inside Location modal ===== */}
          {editType === 'location' && editId && (
            <>
              <div style={{ marginTop: 15 }}>
                <h4 style={{ marginBottom: 10 }}>Specialties hiện có</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 150, overflowY: 'auto' }}>
                  {specialties
                    .filter(s => s.location?._id === editId)
                    .map(s => (
                      <div key={s._id} style={{ display: 'flex', alignItems: 'center', background: '#faq', padding: '5px 10px', borderRadius: 20, gap: 5 }}>
                        <span>{s.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialty(s._id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ff4d4f',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: 14,
                            lineHeight: 1,
                          }}
                          title="Xóa specialty"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              <div style={{ marginTop: 15, display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc' }}
                  value={newSpecialtyName}
                  onChange={e => setNewSpecialtyName(e.target.value)}
                  placeholder="Nhập tên chuyên khoa mới"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSpecialty(); } }}
                />
                <button
                  type="button"
                  onClick={handleAddSpecialty}
                  style={{
                    padding: '6px 15px',
                    borderRadius: 4,
                    border: 'none',
                    backgroundColor: '#1890ff',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Thêm
                </button>
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





// // src/pages/admin/AdminDashboard.jsx
// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../../utils/axiosInstance';
// import Modal from '../../components/ui/Modal';
// import './AdminDashboard.css';

// const AdminDashboard = () => {
//   const [users, setUsers] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [specialties, setSpecialties] = useState([]);

//   const [editType, setEditType] = useState(null);
//   const [editId, setEditId] = useState(null);
//   const [form, setForm] = useState({});
//   const [search, setSearch] = useState('');

//   // ===== Fetch all data =====
//   const fetchAll = async () => {
//     try {
//       const [uRes, dRes, lRes, sRes] = await Promise.all([
//         axiosInstance.get('/admin/users'),
//         axiosInstance.get('/admin/doctors'),
//         axiosInstance.get('/admin/locations'),
//         axiosInstance.get('/admin/specialties')
//       ]);
//       setUsers(uRes.data.data || []);
//       setDoctors(dRes.data.data || []);
//       setLocations(lRes.data.data || []);
//       setSpecialties(sRes.data.data || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => { fetchAll(); }, []);

//   // ===== Helpers =====
//   const pluralize = type => type === 'specialty' ? 'specialties' : type + 's';
//   const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleAdd = type => {
//     setEditType(type);
//     setEditId(null);
//     const fields = formFields[type].reduce((acc, f) => {
//       acc[f.key] = f.type === 'multiselect' ? [] : '';
//       return acc;
//     }, {});
//     setForm(fields);
//   };

//   const handleEdit = (type, item) => {
//     setEditType(type);
//     setEditId(item._id);
//     if (type === 'location') {
//       const attached = specialties.filter(s => Array.isArray(s.locations) && s.locations.includes(item._id)).map(s => s._id);
//       setForm({ ...item, specialties: attached });
//     } else if (type === 'specialty') {
//       const attached = locations.filter(l => Array.isArray(item.locations) && item.locations.includes(l._id)).map(l => l._id);
//       setForm({ ...item, locations: attached });
//     } else {
//       // Nếu user là doctor object, lấy id
//       const copy = { ...item };
//       if (copy.user && typeof copy.user === 'object') copy.user = copy.user._id;
//       if (copy.location && typeof copy.location === 'object') copy.location = copy.location._id;
//       if (copy.specialty && typeof copy.specialty === 'object') copy.specialty = copy.specialty._id;
//       setForm(copy);
//     }
//   };

//   const handleDelete = async (type, id) => {
//     if (!window.confirm('Xác nhận xóa?')) return;
//     try {
//       await axiosInstance.delete(`/admin/${pluralize(type)}/${id}`);
//       if (type === 'user') setUsers(prev => prev.filter(u => u._id !== id));
//       if (type === 'doctor') setDoctors(prev => prev.filter(d => d._id !== id));
//       if (type === 'location') setLocations(prev => prev.filter(l => l._id !== id));
//       if (type === 'specialty') setSpecialties(prev => prev.filter(s => s._id !== id));
//     } catch (err) { console.error(err); }
//   };

//   const handleResetPassword = async userId => {
//     if (!window.confirm('Reset mật khẩu user này?')) return;
//     try {
//       await axiosInstance.post(`/admin/users/${userId}/reset-password`);
//       alert('Reset mật khẩu thành công');
//     } catch (err) { console.error(err); }
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     try {
//       const endpoint = editId
//         ? `/admin/${pluralize(editType)}/${editId}`
//         : `/admin/${pluralize(editType)}`;
//       const res = editId
//         ? await axiosInstance.put(endpoint, form)
//         : await axiosInstance.post(endpoint, form);

//       const data = res.data.data;

//       if (editType === 'user') setUsers(prev => editId ? prev.map(u => u._id === editId ? data.user : u) : [...prev, data.user]);
//       if (editType === 'doctor') setDoctors(prev => editId ? prev.map(d => d._id === editId ? data : d) : [...prev, data]);
//       if (editType === 'location') setLocations(prev => editId ? prev.map(l => l._id === editId ? data : l) : [...prev, data]);
//       if (editType === 'specialty') setSpecialties(prev => editId ? prev.map(s => s._id === editId ? data : s) : [...prev, data]);

//       setEditType(null);
//       setEditId(null);
//       setForm({});
//     } catch (err) { console.error(err); }
//   };

//   // ===== Form fields =====
//   const formFields = {
//     user: [
//       { key: 'fullName', type: 'text' },
//       { key: 'email', type: 'email' },
//       { key: 'role', type: 'select', options: ['admin', 'doctor', 'patient'] },
//       { key: 'location', type: 'select', options: locations.map(l => ({ label: l.name, value: l._id })), dependsOn: 'doctor' },
//       { key: 'specialty', type: 'select', options: specialties.map(s => ({ label: s.name, value: s._id })), dependsOn: 'doctor' },
//     ],
//     doctor: [
//       { key: 'user', type: 'select', options: users.filter(u => u.role === 'doctor').map(u => ({ label: u.fullName, value: u._id })) },
//       { key: 'location', type: 'select', options: locations.map(l => ({ label: l.name, value: l._id })) },
//       { key: 'specialty', type: 'select', options: specialties.map(s => ({ label: s.name, value: s._id })) },
//     ],
//     location: [
//       { key: 'name', type: 'text' },
//       { key: 'address', type: 'text' },
//       { key: 'specialties', type: 'multiselect', options: specialties.map(s => ({ label: s.name, value: s._id })) },
//     ],
//     specialty: [
//       { key: 'name', type: 'text' },
//       { key: 'description', type: 'text' },
//       { key: 'locations', type: 'multiselect', options: locations.map(l => ({ label: l.name, value: l._id })) },
//     ]
//   };

//   // ===== Render Table =====
//   const renderTable = (data, type, columns) => {
//     const filtered = data.filter(item =>
//       !search || columns.some(c => {
//         const val = item[c];
//         if (val === null || val === undefined) return false;
//         if (typeof val === 'object') {
//           if (val.fullName) return val.fullName.toLowerCase().includes(search.toLowerCase());
//           if (val.name) return val.name.toLowerCase().includes(search.toLowerCase());
//           return false;
//         }
//         return val.toString().toLowerCase().includes(search.toLowerCase());
//       })
//     );

//     return (
//       <div className="admin-section">
//         <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
//         <div className="table-actions">
//           <button onClick={() => handleAdd(type)}>Thêm {type}</button>
//           <input placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
//         </div>
//         <table>
//           <thead>
//             <tr>
//               {columns.map(col => <th key={col}>{col}</th>)}
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map(item => (
//               <tr key={item._id}>
//                 {columns.map(col => {
//                   let value = item[col] ?? '-';
//                   if (col === 'user' && typeof value === 'object') value = value.fullName || '-';
//                   if (col === 'location' && typeof value === 'object') value = value.name || '-';
//                   if (col === 'specialty' && typeof value === 'object') value = value.name || '-';
//                   if ((col === 'locations' || col === 'specialties') && Array.isArray(value))
//                     value = value.map(id => {
//                       const s = specialties.find(s => s._id === id);
//                       if (s) return s.name;
//                       const l = locations.find(l => l._id === id);
//                       if (l) return l.name;
//                       return '';
//                     }).join(', ') || '-';
//                   return <td key={col}>{value}</td>;
//                 })}
//                 <td>
//                   <button onClick={() => handleEdit(type, item)}>Sửa</button>
//                   <button onClick={() => handleDelete(type, item._id)}>Xóa</button>
//                   {type === 'user' && <button onClick={() => handleResetPassword(item._id)}>Reset PW</button>}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   };

//   return (
//     <div className="admin-dashboard">
//       <h2>Admin Dashboard</h2>

//       {renderTable(users, 'user', ['fullName','email','role','location','specialty'])}
//       {renderTable(doctors, 'doctor', ['user','specialty','location'])}
//       {renderTable(specialties, 'specialty', ['name','description','locations'])}
//       {renderTable(locations, 'location', ['name','address','specialties'])}

//       {/* ===== Modal Form ===== */}
//       <Modal
//         isOpen={!!editType}
//         title={`${editId ? 'Sửa' : 'Thêm'} ${editType}`}
//         onClose={() => { setEditType(null); setEditId(null); setForm({}); }}
//         size="medium"
//       >
//         <form onSubmit={handleSubmit}>
//           {editType && formFields[editType].map(f => {
//             if (f.dependsOn && form.role !== f.dependsOn) return null;
//             if (['text','email'].includes(f.type)) return (
//               <div key={f.key}>
//                 <label>{f.key}</label>
//                 <input name={f.key} type={f.type} value={form[f.key] || ''} onChange={handleChange} required />
//               </div>
//             );
//             if (f.type === 'select') return (
//               <div key={f.key}>
//                 <label>{f.key}</label>
//                 <select name={f.key} value={form[f.key] || ''} onChange={handleChange} required>
//                   <option value=''>Chọn {f.key}</option>
//                   {f.options.map(opt => typeof opt === 'string'
//                     ? <option key={opt} value={opt}>{opt}</option>
//                     : <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//                 </select>
//               </div>
//             );
//             if (f.type === 'multiselect') return (
//               <div key={f.key}>
//                 <label>{f.key}</label>
//                 <select multiple name={f.key} value={form[f.key] || []} onChange={e => {
//                   const selected = Array.from(e.target.selectedOptions).map(o => o.value);
//                   setForm({ ...form, [f.key]: selected });
//                 }}>
//                   {f.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//                 </select>
//               </div>
//             );
//             return null;
//           })}
//           <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
//             <button type="submit">{editId ? 'Cập nhật' : 'Thêm'}</button>
//             <button type="button" onClick={() => { setEditType(null); setEditId(null); setForm({}); }}>Hủy</button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// };

// export default AdminDashboard;
