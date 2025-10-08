import { formatDate } from '../../lib/test-utils';

describe('formatDate', () => {
  it('should format date to the expected string format', () => {
    const date = new Date(2023, 0, 15); // January 15, 2023
    const result = formatDate(date);
    expect(result).toBe('Jan 15, 2023');
  });

  it('should format date with different months correctly', () => {
    const marchDate = new Date(2023, 2, 20); // March 20, 2023
    const result = formatDate(marchDate);
    expect(result).toBe('Mar 20, 2023');

    const decemberDate = new Date(2023, 11, 25); // December 25, 2023
    const result2 = formatDate(decemberDate);
    expect(result2).toBe('Dec 25, 2023');
  });

  it('should format date with different years correctly', () => {
    const oldDate = new Date(1999, 5, 10); // June 10, 1999
    const result = formatDate(oldDate);
    expect(result).toBe('Jun 10, 1999');

    const futureDate = new Date(2030, 8, 5); // September 5, 2030
    const result2 = formatDate(futureDate);
    expect(result2).toBe('Sep 5, 2030');
  });

  it('should handle edge cases like the first and last days of months', () => {
    const janFirst = new Date(2023, 0, 1); // January 1, 2023
    const result = formatDate(janFirst);
    expect(result).toBe('Jan 1, 2023');

    const febLast = new Date(2023, 1, 28); // February 28, 2023
    const result2 = formatDate(febLast);
    expect(result2).toBe('Feb 28, 2023');
  });

  it('should format dates consistently using en-US locale', () => {
    const date = new Date(2023, 6, 4); // July 4, 2023
    const result = formatDate(date);
    expect(result).toBe('Jul 4, 2023');
  });
});