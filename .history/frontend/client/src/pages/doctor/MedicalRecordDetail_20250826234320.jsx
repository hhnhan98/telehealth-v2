import React from 'react';
import { Modal } from '../../components/ui/Modal';

const MedicalRecordDetail = ({ record, onClose }) => {
  return (
    <Modal onClose={onClose} title="Chi tiết phiếu khám" size="large">
      <div className="medical-record-detail">
        <p><strong>Bệnh nhân:</strong> {record.patient?.fullName}</p>
        <p><strong>Bác sĩ:</strong> {record.doctor?.fullName}</p>
        <p><strong>Ngày khám:</strong> {new Date(record.date).toLocaleDateString()}</p>
        <p><strong>Triệu chứng:</strong> {record.symptoms}</p>
        <p><strong>Chẩn đoán:</strong> {record.diagnosis}</p>
        {record.height && <p><strong>Chiều cao:</strong> {record.height} cm</p>}
        {record.weight && <p><strong>Cân nặng:</strong> {record.weight} kg</p>}
        {record.bp && <p><strong>Huyết áp:</strong> {record.bp}</p>}
        {record.pulse && <p><strong>Nhịp tim:</strong> {record.pulse}</p>}
        {record.bmi && <p><strong>BMI:</strong> {record.bmi}</p>}
        {record.notes && <p><strong>Ghi chú:</strong> {record.notes}</p>}
        {record.prescriptions?.length > 0 && (
          <>
            <strong>Đơn thuốc:</strong>
            <ul>
              {record.prescriptions.map((p, i) => (
                <li key={i}>
                  {p.name} - {p.dose} - Số lượng: {p.quantity} {p.note && `(${p.note})`}
                </li>
              ))}
            </ul>
          </>
        )}
        {record.conclusion && <p><strong>Kết luận:</strong> {record.conclusion}</p>}
        {record.careAdvice && <p><strong>Lời khuyên:</strong> {record.careAdvice}</p>}
      </div>
    </Modal>
  );
};

export default MedicalRecordDetail;
