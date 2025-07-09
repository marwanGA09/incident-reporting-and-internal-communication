export function textShorter(note: string, maxLength: number) {
  const trimmedNote = note.trim();
  return trimmedNote.length > maxLength
    ? `${trimmedNote.substring(0, maxLength)}  . . .`
    : trimmedNote;
}
