const medicalRecordSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: { type: String },
  diagnosis: { type: String },
  notes: { type: String },
  prescriptions: [
    { name: String, dose: String, quantity: Number, note: String }
  ],
}, { timestamps: true });
