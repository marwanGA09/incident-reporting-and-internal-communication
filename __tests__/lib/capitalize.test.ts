import { capitalize } from '../../lib/test-utils';

describe('capitalize', () => {
  it('should capitalize the first letter of a string', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
    expect(capitalize('test')).toBe('Test');
  });

  it('should handle strings with mixed cases', () => {
    expect(capitalize('hELLO')).toBe('HELLO');
    expect(capitalize('wOrLd')).toBe('WOrLd');
    expect(capitalize('tEsT')).toBe('TEsT');
  });

  it('should return the same string if the first character is already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello');
    expect(capitalize('World')).toBe('World');
    expect(capitalize('Test')).toBe('Test');
  });

  it('should handle single character strings', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('z')).toBe('Z');
    expect(capitalize('A')).toBe('A');
  });

  it('should handle empty strings', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle strings with only one character', () => {
    expect(capitalize('x')).toBe('X');
    expect(capitalize('1')).toBe('1');
    expect(capitalize('!')).toBe('!');
  });

  it('should not modify characters after the first', () => {
    expect(capitalize('hELLO')).toBe('HELLO');
    expect(capitalize('t')).toBe('T');
    expect(capitalize('test123')).toBe('Test123');
    expect(capitalize('hello world')).toBe('Hello world');
  });
});