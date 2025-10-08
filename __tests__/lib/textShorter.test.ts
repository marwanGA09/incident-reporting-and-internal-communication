import { textShorter } from '../../lib/textShorter';

describe('textShorter', () => {
  it('should return the original text if it is shorter than or equal to maxLength', () => {
    expect(textShorter('Short text', 20)).toBe('Short text');
    expect(textShorter('Equal length', 12)).toBe('Equal length');
  });

  it('should trim text and add ellipsis if it exceeds maxLength', () => {
    const longText = 'This is a very long text that will be trimmed';
    // Function takes first 10 chars of trimmed text "This is a " and adds "  . . ."
    expect(textShorter(longText, 10)).toBe('This is a  . . .');
  });

  it('should handle empty strings', () => {
    expect(textShorter('', 10)).toBe('');
  });

  it('should handle maxLength of 0', () => {
    expect(textShorter('Any text', 0)).toBe('  . . .'); // Will be trimmed to nothing but still show ellipsis
    expect(textShorter('', 0)).toBe('');
  });

  it('should trim whitespace before checking length', () => {
    expect(textShorter('  Text with spaces  ', 8)).toBe('Text wit  . . .');
    expect(textShorter('   ', 5)).toBe('');
  });

  it('should handle special characters and emojis', () => {
    const textWithEmoji = 'Hello 😊 World!';
    expect(textShorter(textWithEmoji, 8)).toBe('Hello 😊  . . .');
  });

  it('should correctly handle exactly maxLength characters', () => {
    const text = 'Exactly8'; // 8 characters
    expect(textShorter(text, 8)).toBe('Exactly8');
  });

  it('should handle maxLength greater than text length', () => {
    expect(textShorter('Short', 20)).toBe('Short');
  });
});