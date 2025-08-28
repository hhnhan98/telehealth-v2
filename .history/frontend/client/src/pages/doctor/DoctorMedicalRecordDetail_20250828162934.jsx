import React from 'react';
import Modal from '../../components/ui/Modal';
import dayjs from 'dayjs';
import './styles/DoctorMedicalRecordDetail.css'; // CSS riêng cho modal

const DoctorMedicalRecordDetail = ({ record, onClose }) => {
  const formatDate = (date) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-');

  if (!record) return null;

  return (
    <Modal onClose={onClose} 
           title={`Chi tiết phiếu khám - ${record.patient?.fullName || '-'}`}
           size="full"
    >
            
      <div className="medical-record-detail-modal">
        <div className="modal-section">
          <h3>Thông tin chung</h3>
          <p><strong>Bệnh nhân:</strong> {record.patient?.fullName || '-'}</p>
          <p><strong>Bác sĩ:</strong> {record.doctorName || record.doctor?.fullName || '-'}</p>
          <p><strong>Chuyên khoa:</strong> {record.specialtyName || '-'}</p>
          <p><strong>Cơ sở:</strong> {record.locationName || '-'}</p>
          <p><strong>Ngày khám:</strong> {formatDate(record.appointment?.date)}</p>
        </div>

        <div className="modal-section">
          <h3>Triệu chứng & Chẩn đoán</h3>
          <p><strong>Triệu chứng:</strong> {record.symptoms || '-'}</p>
          <p><strong>Chẩn đoán:</strong> {record.diagnosis || '-'}</p>
        </div>

        <div className="modal-section">
          <h3>Chỉ số cơ thể</h3>
          <p><strong>Chiều cao:</strong> {record.height ? `${record.height} cm` : '-'}</p>
          <p><strong>Cân nặng:</strong> {record.weight ? `${record.weight} kg` : '-'}</p>
          <p><strong>Huyết áp:</strong> {record.bp || '-'}</p>
          <p><strong>Nhịp tim:</strong> {record.pulse || '-'}</p>
          <p><strong>BMI:</strong> {record.bmi || '-'}</p>
        </div>

        {record.notes && (
          <div className="modal-section">
            <h3>Ghi chú</h3>
            <p>{record.notes}</p>
          </div>
        )}

        {record.prescriptions?.length > 0 && (
          <div className="modal-section">
            <h3>Đơn thuốc</h3>
            <table className="prescription-table">
              <thead>
                <tr>
                  <th>Tên thuốc</th>
                  <th>Liều lượng</th>
                  <th>Số lượng</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {record.prescriptions.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.name}</td>
                    <td>{p.dose}</td>
                    <td>{p.quantity}</td>
                    <td>{p.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {record.conclusion && (
          <div className="modal-section">
            <h3>Kết luận</h3>
            <p>{record.conclusion}</p>
          </div>
        )}

        {record.careAdvice && (
          <div className="modal-section">
            <h3>Lời khuyên</h3>
            <p>{record.careAdvice}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DoctorMedicalRecordDetail;
