import { MAX_NOTE_LENGTH } from "~/lib/notes";

export type NoteLengthTone = "normal" | "warning" | "over";

export type NoteLength = {
  count: number;
  max: number;
  tone: NoteLengthTone;
  label: string;
};

// Warn in the last tenth, so the Student sees the limit coming before Save
// refuses the note.
const WARNING_THRESHOLD = 0.9;

/**
 * The draft as the server receives it: a form submits each textarea line
 * break as CRLF, and `saveNote` trims before it checks the limit.
 */
export function asSubmitted(body: string): string {
  return body.replace(/\r?\n/g, "\r\n").trim();
}

export function measureNote(body: string): NoteLength {
  const count = asSubmitted(body).length;
  const max = MAX_NOTE_LENGTH;
  const tone: NoteLengthTone =
    count > max
      ? "over"
      : count >= max * WARNING_THRESHOLD
        ? "warning"
        : "normal";
  return {
    count,
    max,
    tone,
    label: `${count.toLocaleString("en")} / ${max.toLocaleString("en")}`,
  };
}
