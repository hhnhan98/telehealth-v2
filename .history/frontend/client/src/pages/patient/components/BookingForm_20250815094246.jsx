import React, { useEffect, useState } from 'react'; 
import axios from '../../../utils/axiosInstance';
import "./BookingForm-v2.css";

const BookingForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dob: "",
    phone: "",
    email: "",
    reason: "",
    facility: "",
    specialty: "",
    doctor: "",
    date: "",
    time: "",
  });

  const [facilities, setFacilities] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách cơ sở y tế
  useEffect(() => {
    axios.get("/api/facilities").then((res) => setFacilities(res.data));
  }, []);

  // Lấy danh sách chuyên khoa khi chọn cơ sở
  useEffect(() => {
    if (formData.facility) {
      axios
        .get(`/api/specialties?facility=${formData.facility}`)
        .then((res) => setSpecialties(res.data));
    }
  }, [formData.facility]);

  // Lấy danh sách bác sĩ khi chọn chuyên khoa
  useEffect(() => {
    if (formData.specialty) {
      axios
        .get(`/api/doctors?specialty=${formData.specialty}`)
        .then((res) => setDoctors(res.data));
    }
  }, [formData.specialty]);

  // Lấy khung giờ trống khi chọn bác sĩ + ngày
  useEffect(() => {
    if (formData.doctor && formData.date) {
      axios
        .get(`/api/doctors/${formData.doctor}/available-times?date=${formData.date}`)
        .then((res) => setAvailableTimes(res.data));
    }
  }, [formData.doctor, formData.date]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/appointments", formData);
      alert("Đặt lịch thành công!");
      setFormData({
        fullName: "",
        gender: "",
        dob: "",
        phone: "",
        email: "",
        reason: "",
        facility: "",
        specialty: "",
        doctor: "",
        date: "",
        time: "",
      });
    } catch (error) {
      alert("Có lỗi xảy ra khi đặt lịch!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-container">
      <h2 className="form-title">Đặt lịch khám bệnh</h2>
      <form onSubmit={handleSubmit} className="booking-form">
        
        {/* --- Thông tin đặt lịch --- */}
        <div className="form-section">
          <h3>Thông tin đặt lịch</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Cơ sở y tế</label>
              <select name="facility" value={formData.facility} onChange={handleChange}>
                <option value="">-- Chọn cơ sở --</option>
                {facilities.map((f) => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Chuyên khoa</label>
              <select name="specialty" value={formData.specialty} onChange={handleChange}>
                <option value="">-- Chọn chuyên khoa --</option>
                {specialties.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bác sĩ</label>
              <select name="doctor" value={formData.doctor} onChange={handleChange}>
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Ngày khám</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Giờ khám</label>
              <select name="time" value={formData.time} onChange={handleChange}>
                <option value="">-- Chọn giờ --</option>
                {availableTimes.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- Thông tin bệnh nhân --- */}
        <div className="form-section">
          <h3>Thông tin bệnh nhân</h3>
          <div className="form-row">
            <div className="form-group">
              <input type="text" name="fullName" placeholder="Họ và tên" value={formData.fullName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
            <div className="form-group">
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input type="text" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <textarea name="reason" placeholder="Lý do khám" value={formData.reason} onChange={handleChange}></textarea>
          </div>
        </div>

        <div className="form-submit">
          <button type="submit" disabled={loading}>
            {loading ? "Đang gửi..." : "Đặt lịch"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
