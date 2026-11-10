import { asSubmitted, measureNote, type NoteLength } from "./lib/length";

export type { NoteLength, NoteLengthTone } from "./lib/length";

/**
 * How long a Note draft is against the limit `saveNote` enforces, counted
 * the way the server will count it, for the counter under the Note editor.
 */
export function noteLength(body: string): NoteLength {
  return measureNote(body);
}

/** Whether Save can succeed: a draft that is empty or over the limit cannot. */
export function canSaveNote(body: string): boolean {
  const { count, tone } = measureNote(body);
  return count > 0 && tone !== "over";
}

/** Whether saving the draft would change the saved Note body. */
export function isNoteChanged(draft: string, savedBody: string): boolean {
  return asSubmitted(draft) !== asSubmitted(savedBody);
}
