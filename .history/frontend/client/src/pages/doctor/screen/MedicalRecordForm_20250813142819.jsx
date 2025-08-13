import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import Button from '../../components/ui/button';
import './MedicalRecord.css';

const MedicalRecordForm = ({ patientId, record, onSuccess, onCancel }) => {
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  const [notes, setNotes] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load dữ liệu khi chỉnh sửa hoặc reset khi tạo mới
  useEffect(() => {
    if (record) {
      setSymptoms(record.symptoms || '');
      setDiagnosis(record.diagnosis || '');
      setPrescriptions(record.prescriptions || '');
      setNotes(record.notes || '');
      setVisitDate(record.visitDate ? record.visitDate.slice(0, 10) : '');
    } else {
      setSymptoms('');
      setDiagnosis('');
      setPrescriptions('');
      setNotes('');
      setVisitDate('');
    }
    setError(null);
  }, [record]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!symptoms) {
      setError('Triệu chứng là bắt buộc');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      patient: patientId,
      symptoms,
      diagnosis,
      prescriptions,
      notes,
      visitDate: visitDate || new Date().toISOString(),
    };

    try {
      if (record) {
        // Cập nhật hồ sơ
        await axios.put(`/medical-records/${record._id}`, payload);
      } else {
        // Tạo hồ sơ mới
        await axios.post('/medical-records', payload);
      }

      // Gọi callback thành công
      onSuccess();

      // Reset form khi tạo mới
      if (!record) {
        setSymptoms('');
        setDiagnosis('');
        setPrescriptions('');
        setNotes('');
        setVisitDate('');
      }
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.error || 'Lỗi khi lưu hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="medical-record-form">
      {error && <p className="error">{error}</p>}

      <div className="form-group">
        <label>Ngày khám</label>
        <input
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
        />
      </div>

      <div className="form-group">
        <label>Triệu chứng *</label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          required
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Chẩn đoán</label>
        <textarea
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Đơn thuốc</label>
        <textarea
          value={prescriptions}
          onChange={(e) => setPrescriptions(e.target.value)}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Ghi chú</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      <div className="form-actions">
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : record ? 'Cập nhật' : 'Tạo mới'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
      </div>
    </form>
  );
};

export default MedicalRecordForm;
