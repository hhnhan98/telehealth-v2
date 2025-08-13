import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../../utils/axiosInstance';
import Button from '../../components/ui/button';
import Modal from '../../components/ui/modal';
import MedicalRecordForm from './MedicalRecordForm';
import './MedicalRecord.css';

const MedicalRecordList = ({ patientId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // --- Fetch hồ sơ bệnh án ---
  const fetchRecords = useCallback(async () => {
    if (!patientId) {
      console.warn('patientId chưa được truyền vào component!');
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Gọi API /medical-records/patient/' + patientId);
      const response = await axios.get(`/medical-records/patient/${patientId}`);
      setRecords(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi gọi API hồ sơ bệnh án:', err.response || err);
      setError('Lỗi khi tải hồ sơ bệnh án');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) fetchRecords();
  }, [patientId, fetchRecords]);

  // --- Mở modal tạo mới ---
  const openCreateModal = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  // --- Mở modal sửa ---
  const openEditModal = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  // --- Xóa hồ sơ ---
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa hồ sơ này?')) return;
    try {
      await axios.delete(`/medical-records/${id}`);
      fetchRecords();
    } catch (err) {
      console.error('Xóa hồ sơ thất bại:', err.response || err);
      alert('Xóa hồ sơ thất bại');
    }
  };

  // --- Sau khi submit form thành công ---
  const handleFormSuccess = () => {
    setModalOpen(false);
    fetchRecords();
  };

  return (
    <div className="medical-record-list">
      <h3>Hồ sơ bệnh án</h3>
      <Button onClick={openCreateModal}>Tạo hồ sơ mới</Button>

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
              records.map((record) => (
                <tr key={record._id}>
                  <td>{record.visitDate ? new Date(record.visitDate).toLocaleDateString() : '-'}</td>
                  <td>{record.symptoms || '-'}</td>
                  <td>{record.diagnosis || '-'}</td>
                  <td>{record.prescriptions || '-'}</td>
                  <td>{record.notes || '-'}</td>
                  <td>
                    <Button variant="outline" size="sm" onClick={() => openEditModal(record)}>
                      Sửa
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(record._id)}>
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
        <Modal
          onClose={() => setModalOpen(false)}
          title={editingRecord ? 'Cập nhật hồ sơ' : 'Tạo hồ sơ'}
        >
          <MedicalRecordForm
            patientId={patientId}
            record={editingRecord}
            onSuccess={handleFormSuccess}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default MedicalRecordList;
