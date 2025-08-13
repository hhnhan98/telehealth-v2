import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';

const MedicalRecordForm = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patient: '',
    diagnosis: '',
    prescription: '',
    notes: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách bệnh nhân khi component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('/users?role=patient');
        setPatients(res.data);
      } catch (err) {
        setError('Lỗi khi tải danh sách bệnh nhân');
      }
    };
    fetchPatients();
  }, []);

  // Nếu có recordId (edit), tải dữ liệu cũ
  useEffect(() => {
    if (recordId) {
      const fetchRecord = async () => {
        try {
          const res = await axios.get(`/medicalRecords/${recordId}`);
          setFormData({
            patient: res.data.patient._id,
            diagnosis: res.data.diagnosis,
            prescription: res.data.prescription || '',
            notes: res.data.notes || '',
          });
        } catch (err) {
          setError('Lỗi khi tải dữ liệu hồ sơ');
        }
      };
      fetchRecord();
    }
  }, [recordId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (recordId) {
        await axios.put(`/medicalRecords/${recordId}`, formData);
      } else {
        await axios.post('/medicalRecords', formData);
      }
      navigate('/doctor/medical-records');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label>Bệnh nhân:</label>
        <select
          name="patient"
          value={formData.patient}
          onChange={handleChange}
          required
          disabled={!!recordId}
        >
          <option value="">-- Chọn bệnh nhân --</option>
          {patients.map(p => (
            <option key={p._id} value={p._id}>
              {p.fullName} ({p.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Chẩn đoán:</label>
        <textarea
          name="diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Đơn thuốc:</label>
        <textarea
          name="prescription"
          value={formData.prescription}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Ghi chú:</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Đang lưu...' : recordId ? 'Cập nhật hồ sơ' : 'Tạo hồ sơ mới'}
      </button>
    </form>
  );
};

export default MedicalRecordForm;
