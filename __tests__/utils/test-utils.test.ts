import { formatDate, capitalize } from '../../lib/test-utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format a date correctly', () => {
      const date = new Date('2023-12-25');
      expect(formatDate(date)).toBe('Dec 25, 2023');
    });

    it('should handle different date inputs', () => {
      const date = new Date('2024-01-01');
      expect(formatDate(date)).toBe('Jan 1, 2024');
    });
  });

  describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });

    it('should not change already capitalized strings', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });
  });
});