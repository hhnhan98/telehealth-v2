// backend/tests/timezone.unit.test.js
const { toUTC, toVN, formatVN } = require('../utils/timezone');

describe('Timezone Utils', () => {
  const vnDate = '2025-08-25';
  const vnTime = '10:30';
  const vnDatetimeStr = `${vnDate} ${vnTime}`; // input theo giờ VN

  test('toUTC should convert VN datetime to UTC correctly', () => {
    const utcDate = toUTC(vnDatetimeStr);
    expect(utcDate.toISOString()).toBe('2025-08-25T03:30:00.000Z'); 
  });

  test('toVN should convert UTC datetime back to VN correctly', () => {
    const utcDate = new Date('2025-08-25T03:30:00.000Z');
    const vnDateObj = toVN(utcDate);
    expect(formatVN(vnDateObj, 'YYYY-MM-DD HH:mm')).toBe('2025-08-25 10:30');
  });

  test('formatVN should format datetime in VN timezone', () => {
    const utcDate = new Date('2025-08-25T03:30:00.000Z');
    const formatted = formatVN(utcDate, 'YYYY-MM-DD HH:mm:ss');
    expect(formatted).toBe('2025-08-25 10:30:00');
  });
});
