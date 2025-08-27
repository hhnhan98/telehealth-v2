// src/pages/doctor/DoctorMedicalForm.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/DoctorMedicalForm.css';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

export default function DoctorMedicalForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [form, setForm] = useState({
    height: '',
    weight: '',
    bp: '',
    pulse: '',
    symptoms: '',
    diagnosis: '',
    notes: '',
    prescriptions: [{ name: '', dose: '', quantity: 1, unit: '', note: '' }],
    conclusion: '',
    careAdvice: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch appointment info
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`/api/doctors/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointment(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi tải thông tin cuộc hẹn');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...form.prescriptions];
    updated[index][field] = value;
    setForm({ ...form, prescriptions: updated });
  };

  const addPrescription = () =>
    setForm({
      ...form,
      prescriptions: [...form.prescriptions, { name: '', dose: '', quantity: 1, unit: '', note: '' }],
    });

  const removePrescription = (index) =>
    setForm({
      ...form,
      prescriptions: form.prescriptions.filter((_, i) => i !== index),
    });

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!form.height.trim()) errors.height = 'Vui lòng nhập chiều cao';
    if (!form.weight.trim()) errors.weight = 'Vui lòng nhập cân nặng';
    if (!form.symptoms.trim()) errors.symptoms = 'Vui lòng nhập triệu chứng';
    if (!form.diagnosis.trim()) errors.diagnosis = 'Vui lòng nhập chẩn đoán';
    form.prescriptions.forEach((p, idx) => {
      if (!p.name.trim()) errors[`prescription-name-${idx}`] = 'Tên thuốc không được trống';
      if (!p.dose.trim()) errors[`prescription-dose-${idx}`] = 'Liều lượng không được trống';
      if (!p.quantity || p.quantity < 1) errors[`prescription-quantity-${idx}`] = 'Số lượng phải >= 1';
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/medical-records', { appointmentId: id, ...form }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Phiếu khám đã được lưu!');
      navigate(`/doctor/appointments/${id}/medical-receipt/view`);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu phiếu khám');
      toast.error(err.response?.data?.message || 'Lỗi lưu phiếu khám');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="loading">Đang tải thông tin cuộc hẹn...</p>;
  if (error) return <p className="error">{error}</p>;

  const bmi = form.height && form.weight ? (form.weight / ((form.height/100)**2)).toFixed(1) : '';

  return (
    <div className="medical-form-background">
      <Card className="medical-form-container">
        <h2 className="form-title">PHIẾU KHÁM BỆNH</h2>

        <div className="patient-info">
          <h3>Thông tin bệnh nhân</h3>
          <p><strong>Họ & tên:</strong> {appointment.patient.fullName}</p>
          <p><strong>Ngày sinh:</strong> {appointment.patient.dob || '---'}</p>
          <p><strong>Giới tính:</strong> {appointment.patient.gender || '---'}</p>
          <p><strong>Địa chỉ:</strong> {appointment.patient.address || '---'}</p>
          <p><strong>Liên lạc:</strong> {appointment.patient.phone || '---'}</p>
          <p><strong>CMND/CCCD:</strong> {appointment.patient.idNumber || '---'}</p>
          <p><strong>Email:</strong> {appointment.patient.email || '---'}</p>
          <p><strong>Bác sĩ:</strong> {appointment.doctor.fullName}</p>
          <p><strong>Ngày/giờ:</strong> {appointment.date} {appointment.time}</p>
        </div>

        <form onSubmit={handleSubmit} className="medical-form">
          <Card className="section-card">
            <h3>Khám thể lực</h3>
            <div className="form-row">
              <input name="height" value={form.height} onChange={handleChange} placeholder="Chiều cao (cm)" className={formErrors.height ? 'error-input' : ''}/>
              <input name="weight" value={form.weight} onChange={handleChange} placeholder="Cân nặng (kg)" className={formErrors.weight ? 'error-input' : ''}/>
              <input name="bp" value={form.bp} onChange={handleChange} placeholder="Huyết áp (mmHg)"/>
              <input name="pulse" value={form.pulse} onChange={handleChange} placeholder="Mạch (lần/phút)"/>
              {bmi && <input value={bmi} readOnly placeholder="BMI"/>}
            </div>
          </Card>

          <Card className="section-card">
            <h3>Triệu chứng & Chẩn đoán</h3>
            <textarea name="symptoms" value={form.symptoms} onChange={handleChange} placeholder="Triệu chứng" className={formErrors.symptoms ? 'error-input' : ''}/>
            {formErrors.symptoms && <p className="error-text">{formErrors.symptoms}</p>}
            <textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} placeholder="Chẩn đoán" className={formErrors.diagnosis ? 'error-input' : ''}/>
            {formErrors.diagnosis && <p className="error-text">{formErrors.diagnosis}</p>}
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Ghi chú"/>
          </Card>

          <Card className="section-card">
            <h3>Danh sách thuốc</h3>
            {form.prescriptions.map((p, idx) => (
              <div key={idx} className="prescription-row">
                <input placeholder="Tên thuốc" 
                       value={p.name} 
                       onChange={e => handlePrescriptionChange(idx,'name',e.target.value)} 
                       className={formErrors[`prescription-name-${idx}`] ? 'error-input' : ''}
                />
                <input placeholder="Liều lượng" 
                       value={p.dose} 
                       onChange={e => handlePrescriptionChange(idx,'dose',e.target.value)} 
                       className={formErrors[`prescription-dose-${idx}`] ? 'error-input' : ''}
                />
                <input type="number" min={1} 
                       placeholder="Số lượng" value={p.quantity} 
                       onChange={e => handlePrescriptionChange(idx,'quantity',e.target.value)} 
                       className={formErrors[`prescription-quantity-${idx}`] ? 'error-input' : ''}
                />
                <input 
                       placeholder="Đơn vị" 
                       value={p.unit} 
                       onChange={e => handlePrescriptionChange(idx,'unit',e.target.value)}
                />
                <input placeholder="Ghi chú" 
                value={p.note} onChange={e => handlePrescriptionChange(idx,'note',e.target.value)}/>
                {form.prescriptions.length > 1 && <Button type="button" className="btn-red" onClick={() => removePrescription(idx)}>Xóa</Button>}
              </div>
            ))}
            <Button type="button" className="btn-green" onClick={addPrescription}>Thêm thuốc</Button>
          </Card>

          <Card className="section-card">
            <h3>Kết luận</h3>
            <textarea name="conclusion" value={form.conclusion} onChange={handleChange} placeholder="Kết luận của bác sĩ"/>
            <textarea name="careAdvice" value={form.careAdvice} onChange={handleChange} placeholder="Hướng dẫn chăm sóc"/>
          </Card>

          <Button type="submit" className="btn-blue" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu phiếu khám'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { Card } from '../../components/ui/Card';
// import Button from '../../components/ui/Button';

// export default function DoctorMedicalForm() {
//   const { id } = useParams(); // appointmentId
//   const navigate = useNavigate();

//   const [appointment, setAppointment] = useState(null);
//   const [form, setForm] = useState({
//     symptoms: '',
//     diagnosis: '',
//     notes: '',
//     prescriptions: [{ name: '', dose: '', quantity: 1, note: '' }],
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [saving, setSaving] = useState(false);

//   // Lấy thông tin appointment
//   useEffect(() => {
//     const fetchAppointment = async () => {
//       try {
//         setLoading(true);
//         setError('');
//         const token = localStorage.getItem('token');
//         const { data } = await axios.get(`/api/doctors/appointments/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setAppointment(data.data);
//       } catch (err) {
//         console.error(err);
//         setError(err.response?.data?.message || 'Lỗi tải appointment');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAppointment();
//   }, [id]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handlePrescriptionChange = (index, field, value) => {
//     const updated = [...form.prescriptions];
//     updated[index][field] = value;
//     setForm({ ...form, prescriptions: updated });
//   };

//   const addPrescription = () => {
//     setForm({
//       ...form,
//       prescriptions: [...form.prescriptions, { name: '', dose: '', quantity: 1, note: '' }],
//     });
//   };

//   const removePrescription = (index) => {
//     const updated = form.prescriptions.filter((_, i) => i !== index);
//     setForm({ ...form, prescriptions: updated });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setSaving(true);
//       const token = localStorage.getItem('token');

//       // Tạo medical record + update status appointment (backend đã xử lý)
//       await axios.post(
//         '/api/medical-records',
//         { appointmentId: id, ...form },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       alert('Phiếu khám tạo thành công! Trạng thái cuộc hẹn đã được cập nhật.');
//       navigate(`/doctor/appointments/${id}`); // redirect về chi tiết appointment
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || 'Lỗi lưu phiếu khám');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading)
//     return <p className="text-center mt-10 text-gray-600">Đang tải thông tin cuộc hẹn...</p>;
//   if (error)
//     return <p className="text-center mt-10 text-red-500">{error}</p>;

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <Card className="mb-6">
//         <h2 className="text-2xl font-semibold mb-4">Phiếu khám bệnh</h2>
//         <div className="space-y-2">
//           <p><strong>Bệnh nhân:</strong> {appointment.patient.fullName}</p>
//           <p><strong>Bác sĩ:</strong> {appointment.doctor.fullName}</p>
//           <p><strong>Ngày/giờ:</strong> {appointment.date} {appointment.time}</p>
//         </div>
//       </Card>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block font-medium mb-1">Triệu chứng</label>
//           <textarea
//             name="symptoms"
//             value={form.symptoms}
//             onChange={handleChange}
//             className="w-full border p-2 rounded"
//             required
//           />
//         </div>

//         <div>
//           <label className="block font-medium mb-1">Chẩn đoán</label>
//           <textarea
//             name="diagnosis"
//             value={form.diagnosis}
//             onChange={handleChange}
//             className="w-full border p-2 rounded"
//             required
//           />
//         </div>

//         <div>
//           <label className="block font-medium mb-1">Ghi chú</label>
//           <textarea
//             name="notes"
//             value={form.notes}
//             onChange={handleChange}
//             className="w-full border p-2 rounded"
//           />
//         </div>

//         <div>
//           <h3 className="font-semibold mb-2">Danh sách thuốc</h3>
//           {form.prescriptions.map((p, idx) => (
//             <div key={idx} className="border p-2 mb-2 rounded space-y-1">
//               <input
//                 placeholder="Tên thuốc"
//                 value={p.name}
//                 onChange={(e) => handlePrescriptionChange(idx, 'name', e.target.value)}
//                 className="w-full border p-1 rounded"
//                 required
//               />
//               <input
//                 placeholder="Liều lượng"
//                 value={p.dose}
//                 onChange={(e) => handlePrescriptionChange(idx, 'dose', e.target.value)}
//                 className="w-full border p-1 rounded"
//                 required
//               />
//               <input
//                 type="number"
//                 min={1}
//                 placeholder="Số lượng"
//                 value={p.quantity}
//                 onChange={(e) => handlePrescriptionChange(idx, 'quantity', e.target.value)}
//                 className="w-full border p-1 rounded"
//                 required
//               />
//               <input
//                 placeholder="Ghi chú"
//                 value={p.note}
//                 onChange={(e) => handlePrescriptionChange(idx, 'note', e.target.value)}
//                 className="w-full border p-1 rounded"
//               />
//               {form.prescriptions.length > 1 && (
//                 <Button
//                   type="button"
//                   className="bg-red-500 text-white"
//                   onClick={() => removePrescription(idx)}
//                 >
//                   Xóa
//                 </Button>
//               )}
//             </div>
//           ))}
//           <Button type="button" className="bg-green-500 text-white" onClick={addPrescription}>
//             Thêm thuốc
//           </Button>
//         </div>

//         <Button type="submit" className="bg-blue-500 text-white" disabled={saving}>
//           {saving ? 'Đang lưu...' : 'Lưu phiếu khám'}
//         </Button>
//       </form>
//     </div>
//   );
// }
