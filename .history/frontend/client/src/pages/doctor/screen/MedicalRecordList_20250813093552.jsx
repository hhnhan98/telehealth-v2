import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import Button from '../../components/ui/button';
import Modal from '../../components/ui/modal'; // Giả sử bạn có component modal
import MedicalRecordForm from './MedicalRecordForm'; // Form tạo/cập nhật hồ sơ
import './MedicalRecordList.css';

const MedicalRecordList = ({ patientId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/medical-records/patient/${patientId}`);
      setRecords(res.data);
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchRecords();
  }, [patientId]);

  const handleCreate = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa hồ sơ này?')) return;
    try {
      await axios.delete(`/medical-records/${id}`);
      fetchRecords();
    } catch (err) {
      alert('Xóa hồ sơ thất bại');
    }
  };

  const handleFormSubmit = () => {
    setModalOpen(false);
    fetchRecords();
  };

  return (
    <div className="medical-record-list">
      <h3>Hồ sơ bệnh án</h3>
      <Button variant="default" onClick={handleCreate}>
        Tạo hồ sơ mới
      </Button>

      {loading && <p>Đang tải...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <table className="record-table">
          <thead>
            <tr>
              <th>Ngày khám</th>
              <th>Triệu chứng</th>
              <th>Chẩn đoán</th>
              <th>Đơn thuốc</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  Chưa có hồ sơ bệnh án
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec._id}>
                  <td>{new Date(rec.visitDate).toLocaleDateString()}</td>
                  <td>{rec.symptoms}</td>
                  <td>{rec.diagnosis || '-'}</td>
                  <td>{rec.prescriptions || '-'}</td>
                  <td>{rec.notes || '-'}</td>
                  <td>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(rec)}>
                      Sửa
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(rec._id)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)} title={editingRecord ? 'Cập nhật hồ sơ' : 'Tạo hồ sơ'}>
          <MedicalRecordForm
            patientId={patientId}
            record={editingRecord}
            onSuccess={handleFormSubmit}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default MedicalRecordList;
