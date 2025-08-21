import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosInstance';
import './CreateMedicalRecord.css';

const CreateMedicalRecord = () => {
  const { id } = useParams(); // id của bệnh nhân
  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await axios.post('/records', {
        patientId: id,
        symptoms,
        diagnosis,
        notes,
      });

      navigate(`/doctor/patients/${id}`); // Quay lại trang chi tiết bệnh nhân
    } catch (error) {
      console.error('Lỗi tạo hồ sơ:', error);
      setErrorMsg('Không thể tạo hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-record-container">
      <h2>Tạo hồ sơ bệnh án</h2>
      <form className="record-form" onSubmit={handleSubmit}>
        <label>
          Triệu chứng:
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            required
          />
        </label>

        <label>
          Chẩn đoán:
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
          />
        </label>

        <label>
          Ghi chú thêm (nếu có):
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        {errorMsg && <p className="error">{errorMsg}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
        </button>
      </form>
    </div>
  );
};

export default CreateMedicalRecord;
