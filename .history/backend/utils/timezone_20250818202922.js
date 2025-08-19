const VN_OFFSET_MIN = 7 * 60;

const toVN = (dateUTC) => new Date(dateUTC.getTime() + VN_OFFSET_MIN * 60000);
const toUTC = (dateVN) => new Date(dateVN.getTime() - VN_OFFSET_MIN * 60000);

module.exports = { toVN, toUTC };
