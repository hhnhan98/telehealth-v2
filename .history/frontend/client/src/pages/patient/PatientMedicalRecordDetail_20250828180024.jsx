import React from "react";
import dayjs from "dayjs";

const PatientMedicalRecordDetail = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Chi tiết hồ sơ bệnh án</h3>
          <button onClick={onClose} className="close-btn">
            ✖
          </button>
        </div>

        <div className="modal-body">
          <p>
            <strong>Ngày khám:</strong>{" "}
            {record.appointment?.date
              ? dayjs(record.appointment.date).format("DD/MM/YYYY HH:mm")
              : "-"}
          </p>
          <p>
            <strong>Bác sĩ:</strong>{" "}
            {record.doctorName || record.doctorSnapshot?.fullName || "-"}
          </p>
          <p>
            <strong>Chuyên khoa:</strong>{" "}
            {record.specialtyName || record.doctorSnapshot?.specialtyName || "-"}
          </p>
          <p>
            <strong>Cơ sở:</strong>{" "}
            {record.locationName || record.doctorSnapshot?.locationName || "-"}
          </p>
          <p>
            <strong>Chẩn đoán:</strong> {record.diagnosis || "-"}
          </p>
          <p>
            <strong>Ghi chú:</strong> {record.notes || "-"}
          </p>
          <p>
            <strong>Đơn thuốc:</strong>
          </p>
          {record.prescriptions && record.prescriptions.length > 0 ? (
            <ul>
              {record.prescriptions.map((p, idx) => (
                <li key={idx}>
                  {p.medicineName} - {p.dosage} - {p.duration}
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có đơn thuốc</p>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="close-btn">
            Đóng
          </button>
        </div>
      </div>

      {/* CSS cơ bản */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          border-radius: 8px;
          width: 600px;
          max-width: 90%;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.2s ease-in-out;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .modal-body p {
          margin: 8px 0;
        }
        .modal-footer {
          text-align: right;
          margin-top: 20px;
        }
        .close-btn {
          background: #1976d2;
          border: none;
          padding: 8px 14px;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }
        .close-btn:hover {
          background: #125a9c;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default PatientMedicalRecordDetail;
