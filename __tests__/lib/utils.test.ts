import { cn, isValidUUID } from '../../lib/utils';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'ignored-class');
      expect(result).toBe('base-class conditional-class');
    });

    it('should merge Tailwind classes with conflicts properly', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUIDs', () => {
      const validUUIDs = [
        'a1b2c3d4-e5f6-4890-8234-567890abcdef',
        '00000000-0000-4000-8000-000000000000',
        '12345678-1234-4234-8234-123456789abc',
        '12345678-1234-5678-9012-123456789012', // version 5 UUID
      ];

      validUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(true);
      });
    });

    it('should return false for invalid UUIDs', () => {
      const invalidInputs = [
        null,
        undefined,
        '',
        'invalid',
        '12345',
        '12345678-1234-1234-1234-1234567890123', // too long
        '12345678-1234-1234-1234-12345678901', // too short
        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // non-hex characters
      ];

      invalidInputs.forEach(input => {
        expect(isValidUUID(input as any)).toBe(false);
      });
    });

    it('should handle edge cases correctly', () => {
      // Valid UUID with mixed case
      expect(isValidUUID('A1B2C3D4-E5F6-4890-8234-567890ABCDEF')).toBe(true);
      
      // Valid UUID with uppercase
      expect(isValidUUID('A1B2C3D4-E5F6-4890-8234-567890ABCDEF')).toBe(true);
      
      // Valid UUID with version 5
      expect(isValidUUID('12345678-1234-5678-9012-123456789012')).toBe(true);
    });
  });
});