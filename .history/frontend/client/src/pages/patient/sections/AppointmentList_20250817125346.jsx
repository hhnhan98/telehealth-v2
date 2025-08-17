.appointment-list-container {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  font-family: 'Segoe UI', sans-serif;
}

.appointment-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.appointment-table th, .appointment-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.appointment-table th {
  background-color: #59c2ff;
  color: white;
}

.status.pending { color: #ff9900; font-weight: 600; }
.status.confirmed { color: #28a745; font-weight: 600; }
.status.cancelled { color: #dc3545; font-weight: 600; }
.status.completed { color: #6c757d; font-weight: 600; }

.otp-input { width: 60px; padding: 3px; margin-right: 5px; }
.btn-otp, .btn-resend, .btn-cancel {
  padding: 3px 6px;
  margin-top: 3px;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 4px;
  border: none;
}

.btn-otp { background-color: #28a745; color: white; }
.btn-resend { background-color: #007bff; color: white; }
.btn-cancel { background-color: #dc3545; color: white; }

.toast {
  position: fixed;
  top: 10px;
  right: 10px;
  padding: 10px 15px;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  z-index: 999;
}

.toast.success { background-color: #28a745; }
.toast.error { background-color: #dc3545; }

.toast .close {
  margin-left: 10px;
  cursor: pointer;
}
