import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { toVN, toUTC, formatVN } from '../utils/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Helper để log đẹp
const log = (label, value) => console.log(label, '=>', value);

describe('Timezone Utils', () => {
  test('Convert UTC → VN', () => {
    // BE lưu giờ UTC 2025-08-25T03:30:00Z
    const utcDate = new Date('2025-08-25T03:30:00Z');
    const vnDate = toVN(utcDate);

    log('UTC input', utcDate.toISOString());
    log('VN converted', vnDate.format('YYYY-MM-DD HH:mm'));

    expect(vnDate.format('YYYY-MM-DD HH:mm')).toBe('2025-08-25 10:30'); // +7h
  });

  test('Convert VN → UTC', () => {
    // FE chọn 2025-08-25 10:30 VN
    const vnInput = new Date('2025-08-25T10:30:00');
    const utcDate = toUTC(vnInput);

    log('VN input', vnInput.toISOString());
    log('UTC converted', utcDate.toISOString());

    expect(dayjs(utcDate).utc().format('YYYY-MM-DD HH:mm')).toBe('2025-08-25 03:30');
  });

  test('Format datetime in VN', () => {
    const utcDate = '2025-08-25T03:30:00Z'; // BE UTC
    const formatted = formatVN(utcDate);

    log('UTC raw', utcDate);
    log('Formatted VN', formatted);

    expect(formatted).toBe('2025-08-25 10:30');
  });

  test('Handle invalid date', () => {
    const formatted = formatVN(null);
    expect(formatted).toBe('');
  });
});
