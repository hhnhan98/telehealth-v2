const success = (res, message, data = {}) => res.status(200).json({ success: true, message, data });
const error = (res, message, status = 400) => res.status(status).json({ success: false, message });

module.exports = { success, error };
