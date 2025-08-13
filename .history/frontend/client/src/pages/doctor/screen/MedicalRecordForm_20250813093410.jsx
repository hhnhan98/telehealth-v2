import React, { useState } from 'react';
import axios from '../../../utils/axiosInstance';
import Button from '../../components/ui/button';

const MedicalRecordForm = ({ patientId, record, onSuccess, onCancel }) => {
  const [symptoms, setSymptoms] = useState(record?.symptoms || '');
  const [diagnosis, setDiagnosis] = useState(record?.diagnosis || '');
  const [prescriptions, setPrescriptions] = useState(record?.prescriptions || '');
  const [notes, setNotes] = useState(record?.notes || '');
  const [visitDate, setVisitDate] = useState(record ? record.visitDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (record) {
        await axios.put(`/medical-records/${record._id}`, {
          symptoms,
          diagnosis,
          prescriptions,
          notes,
          visitDate,
        });
      } else {
        // lấy doctor id từ token (backend tự lấy) hoặc gửi từ frontend nếu có
        await axios.post('/medical-records', {
          patient: patientId,
          symptoms,
          diagnosis,
          prescriptions,
          notes,
          visitDate,
        });
      }
      onSuccess();
    } catch (err) {
      setError('Lỗi khi lưu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="medical-record-form">
      <div>
        <label>Ngày khám</label>
        <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} required />
      </div>
      <div>
        <label>Triệu chứng</label>
        <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} required />
      </div>
      <div>
        <label>Chẩn đoán</label>
        <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
      </div>
      <div>
        <label>Đơn thuốc</label>
        <textarea value={prescriptions} onChange={(e) => setPrescriptions(e.target.value)} />
      </div>
      <div>
        <label>Ghi chú</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <Button type="submit" disabled={loading}>
          {record ? 'Cập nhật' : 'Tạo'}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
      </div>
    </form>
  );
};

export default MedicalRecordForm;
