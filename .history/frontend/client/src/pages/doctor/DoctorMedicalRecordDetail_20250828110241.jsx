// ===== CHI TIẾT HỒ SƠ BỆNH ÁN =====
import React from 'react';
import Modal from '../../components/ui/Modal';
import dayjs from 'dayjs';
import Appointment from '..'
const DoctorMedicalRecordDetail = ({ record, onClose }) => {
  const formatDate = (date) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-');

  return (
    <Modal onClose={onClose} title="Chi tiết phiếu khám" size="large">
      <div className="medical-record-detail" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <section>
          <h4>Thông tin chung</h4>
          <p><strong>Bệnh nhân:</strong> {record.patient?.fullName || '-'}</p>
          <p><strong>Bác sĩ:</strong> {record.doctor?.fullName || '-'}</p>
          <p><strong>Ngày khám:</strong> {formatDate(record.appointment?.date)}</p>
        </section>

        <section>
          <h4>Triệu chứng & Chẩn đoán</h4>
          <p><strong>Triệu chứng:</strong> {record.symptoms || '-'}</p>
          <p><strong>Chẩn đoán:</strong> {record.diagnosis || '-'}</p>
        </section>

        <section>
          <h4>Chỉ số cơ thể</h4>
          <p><strong>Chiều cao:</strong> {record.height ? `${record.height} cm` : '-'}</p>
          <p><strong>Cân nặng:</strong> {record.weight ? `${record.weight} kg` : '-'}</p>
          <p><strong>Huyết áp:</strong> {record.bp || '-'}</p>
          <p><strong>Nhịp tim:</strong> {record.pulse || '-'}</p>
          <p><strong>BMI:</strong> {record.bmi || '-'}</p>
        </section>

        {record.notes && (
          <section>
            <h4>Ghi chú</h4>
            <p>{record.notes}</p>
          </section>
        )}

        {record.prescriptions?.length > 0 && (
          <section>
            <h4>Đơn thuốc</h4>
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
                {record.prescriptions.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td>{p.dose}</td>
                    <td>{p.quantity}</td>
                    <td>{p.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {record.conclusion && (
          <section>
            <h4>Kết luận</h4>
            <p>{record.conclusion}</p>
          </section>
        )}

        {record.careAdvice && (
          <section>
            <h4>Lời khuyên</h4>
            <p>{record.careAdvice}</p>
          </section>
        )}
      </div>
    </Modal>
  );
};

export default DoctorMedicalRecordDetail;
