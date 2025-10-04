// ===== PHIẾU KHÁM BỆNH =====
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import axiosInstance from '../../utils/axiosInstance';
import './styles/DoctorMedicalForm.css';
import medicalRecordService from '../../services/medicalRecordService';

export default function DoctorMedicalForm({ onRecordSaved }) {
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

  // -------------------
  // Fetch appointment
  // -------------------
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        console.log(">>> Fetching appointment with id:", id);
        const { data } = await axiosInstance.get(`/doctors/appointments/${id}`);
        console.log(">>> Appointment data fetched:", data.data);
        console.log(">>> Appointment patient id:", data.data.patient?._id);
        setAppointment(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi tải thông tin cuộc hẹn');
        console.error(">>> Error fetching appointment:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  // -------------------
  // Handle input changes
  // -------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`>>> Input changed: ${name} = ${value}`);
    setForm({ ...form, [name]: value });
  };

  const handlePrescriptionChange = (index, field, value) => {
    console.log(`>>> Prescription changed [${index}][${field}] = ${value}`);
    const updated = [...form.prescriptions];
    updated[index][field] = field === 'quantity' ? Number(value) : value;
    setForm({ ...form, prescriptions: updated });
  };

  const addPrescription = () => {
    console.log(">>> Adding new prescription row");
    setForm({
      ...form,
      prescriptions: [...form.prescriptions, { name: '', dose: '', quantity: 1, note: '' }],
    });
  };

  const removePrescription = (index) => {
    console.log(">>> Removing prescription at index:", index);
    setForm({
      ...form,
      prescriptions: form.prescriptions.filter((_, i) => i !== index),
    });
  };

  // -------------------
  // Validate form
  // -------------------
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
    console.log(">>> Form validation errors:", errors);
    return Object.keys(errors).length === 0;
  };

  // -------------------
  // Submit form
  // -------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(">>> Submitting form data:", form);

    if (!validateForm()) {
      console.warn(">>> Form validation failed, cannot submit");
      return;
    }

    if (!appointment || !appointment.patient?._id) {
      console.error(">>> Cannot submit: appointment or patient id missing");
      toast.error('Không có thông tin bệnh nhân, không thể lưu phiếu khám');
      return;
    }

    try {
      setSaving(true);
      const bmi = form.height && form.weight
        ? (form.weight / ((form.height / 100) ** 2)).toFixed(1)
        : '';
      console.log(">>> Calculated BMI:", bmi);

      const payload = {
        appointment: id,
        patient: appointment.patient._id,
        height: form.height,
        weight: form.weight,
        bp: form.bp,
        pulse: form.pulse,
        bmi,
        symptoms: form.symptoms,
        diagnosis: form.diagnosis,
        notes: form.notes,
        prescriptions: form.prescriptions,
        conclusion: form.conclusion,
        careAdvice: form.careAdvice,
      };

      console.log(">>> Payload to send to backend:", payload);

      const res = await medicalRecordService.createMedicalRecord(payload);
      console.log(">>> Response from backend:", res.data);

      toast.success('Phiếu khám đã được lưu!');

      if (onRecordSaved) onRecordSaved(res.data.data);

      navigate(`/doctor/dashboard`);
    } catch (err) {
      console.error(">>> Error submitting form:", err);
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
