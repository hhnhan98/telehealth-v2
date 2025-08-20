const AdminForm = ({editType, form, setForm, onSubmit, onCancel}) => {
  const fields = formFields[editType];
  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

  return (
    <div className="admin-form card">
      <h3>{form._id ? 'Sửa' : 'Thêm'} {editType}</h3>
      <form onSubmit={onSubmit}>
        {fields.map(f => (
          <div key={f}>
            <label>{f}</label>
            <input name={f} value={form[f] || ''} onChange={handleChange} />
          </div>
        ))}
        <button type="submit">{form._id ? 'Cập nhật' : 'Thêm'}</button>
        <button type="button" onClick={onCancel}>Hủy</button>
      </form>
    </div>
  );
};
