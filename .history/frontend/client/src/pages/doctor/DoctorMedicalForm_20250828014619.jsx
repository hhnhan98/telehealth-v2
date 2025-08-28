// ===== PHIẾU KHÁM BỆNH =====
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './styles/DoctorMedicalForm.css';

export default function DoctorMedicalForm() {
  const { id } = useParams(); // appointmentId
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
    prescriptions: [{ name: '', dose: '', quantity: 1, note: '' }],
    conclusion: '',
    careAdvice: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Lấy thông tin appointment
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`/api/doctors/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointment(data.data?.ap);
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
      prescriptions: [...form.prescriptions, { name: '', dose: '', quantity: 1, note: '' }],
    });

  const removePrescription = (index) =>
    setForm({
      ...form,
      prescriptions: form.prescriptions.filter((_, i) => i !== index),
    });

  // Validate form trước khi submit
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
      await axios.post(
        '/api/medical-records',
        { appointmentId: id, ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Phiếu khám đã được lưu!');
      navigate(`/doctor/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu phiếu khám');
      toast.error(err.response?.data?.message || 'Lỗi lưu phiếu khám');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="loading">Đang tải thông tin cuộc hẹn...</p>;
  if (error) return <p className="error">{error}</p>;

  const bmi = form.height && form.weight ? (form.weight / ((form.height / 100) ** 2)).toFixed(1) : '';

  return (
    <div className="medical-form-background">
      <Card className="medical-form-container">
        <h2 className="form-title">PHIẾU KHÁM BỆNH</h2>

        <Card className="section-card">
          <h3>Thông tin bệnh nhân</h3>
          <p><strong>Họ tên:</strong> {appointment.patient.fullName || 'Chưa cập nhật'}</p>
          <p><strong>Năm sinh:</strong> {appointment.patient.birthYear || 'Chưa cập nhật'}</p>
          <p><strong>Quê quán:</strong> {appointment.patient.address || 'Chưa cập nhật'}</p>
        </Card>

        <form onSubmit={handleSubmit} className="medical-form">
          <Card className="section-card">
            <h3>Khám thể lực</h3>
            <div className="form-row two-columns">
              {['height','weight','bp','pulse'].map((key, idx) => (
                <div className="form-group" key={idx}>
                  <label>
                    {key === 'height' ? 'Chiều cao (cm)' :
                     key === 'weight' ? 'Cân nặng (kg)' :
                     key === 'bp' ? 'Huyết áp (mmHg)' :
                     'Mạch (lần/phút)'}
                  </label>
                  <input
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    className={formErrors[key] ? 'error-input' : ''}
                  />
                </div>
              ))}
              {bmi && (
                <div className="form-group">
                  <label>BMI</label>
                  <input value={bmi} readOnly />
                </div>
              )}
            </div>
          </Card>

          <Card className="section-card">
            <h3>Triệu chứng & Chẩn đoán</h3>
            {['symptoms','diagnosis','notes'].map((key, idx) => (
              <div className="form-group" key={idx}>
                <label>{key === 'symptoms' ? 'Triệu chứng' : key === 'diagnosis' ? 'Chẩn đoán' : 'Ghi chú'}</label>
                <textarea
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  className={formErrors[key] ? 'error-input' : ''}
                />
                {formErrors[key] && <p className="error-text">{formErrors[key]}</p>}
              </div>
            ))}
          </Card>

          <Card className="section-card">
            <h3>Danh sách thuốc</h3>
            {form.prescriptions.map((p, idx) => (
              <div key={idx} className="prescription-row two-columns">
                {['name','dose','quantity','note'].map(field => (
                  <div className="form-group" key={field}>
                    <label>{field === 'name' ? 'Tên thuốc' :
                            field === 'dose' ? 'Liều lượng' :
                            field === 'quantity' ? 'Số lượng' :
                            'Ghi chú'}</label>
                    <input
                      type={field === 'quantity' ? 'number' : 'text'}
                      min={field === 'quantity' ? 1 : undefined}
                      value={p[field]}
                      onChange={e => handlePrescriptionChange(idx,field,e.target.value)}
                      className={formErrors[`prescription-${field}-${idx}`] ? 'error-input' : ''}
                    />
                  </div>
                ))}
                {form.prescriptions.length > 1 && (
                  <Button type="button" className="btn-red" onClick={() => removePrescription(idx)}>Xóa</Button>
                )}
              </div>
            ))}
            <Button type="button" className="btn-green" onClick={addPrescription}>Thêm thuốc</Button>
          </Card>

          <Card className="section-card">
            <h3>Kết luận & Hướng dẫn</h3>
            {['conclusion','careAdvice'].map((key, idx) => (
              <div className="form-group" key={idx}>
                <label>{key === 'conclusion' ? 'Kết luận' : 'Hướng dẫn chăm sóc'}</label>
                <textarea
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </Card>

          <Button type="submit" className="btn-blue" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu phiếu khám'}
          </Button>
        </form>
      </Card>
    </div>
  );
}