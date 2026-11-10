import { describe, it, expect } from "vitest";
import { canSaveNote, isNoteChanged, noteLength } from "../index";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

describe("noteLength", () => {
  it("counts an empty draft as zero", () => {
    expect(noteLength("")).toEqual({
      count: 0,
      max: MAX_NOTE_LENGTH,
      tone: "normal",
      label: "0 / 2,000",
    });
  });

  it("ignores leading and trailing whitespace, as saving does", () => {
    expect(noteLength("  hello \n").count).toBe(5);
  });

  it("stays normal below ninety percent of the limit", () => {
    expect(noteLength("a".repeat(1799)).tone).toBe("normal");
  });

  it("warns from ninety percent of the limit", () => {
    expect(noteLength("a".repeat(1800)).tone).toBe("warning");
  });

  it("still warns at exactly the limit", () => {
    const length = noteLength("a".repeat(MAX_NOTE_LENGTH));
    expect(length.tone).toBe("warning");
    expect(length.label).toBe("2,000 / 2,000");
  });

  it("is over one character past the limit", () => {
    expect(noteLength("a".repeat(MAX_NOTE_LENGTH + 1)).tone).toBe("over");
  });
});

describe("canSaveNote", () => {
  it("refuses an empty or whitespace-only draft", () => {
    expect(canSaveNote("")).toBe(false);
    expect(canSaveNote("   \n ")).toBe(false);
  });

  it("accepts a draft up to the limit", () => {
    expect(canSaveNote("a")).toBe(true);
    expect(canSaveNote("a".repeat(MAX_NOTE_LENGTH))).toBe(true);
  });

  it("refuses a draft over the limit", () => {
    expect(canSaveNote("a".repeat(MAX_NOTE_LENGTH + 1))).toBe(false);
  });
});

describe("line breaks", () => {
  it("counts each line break as two characters, as the form submits it", () => {
    expect(noteLength("a\nb").count).toBe(4);
    expect(noteLength("a\r\nb").count).toBe(4);
  });

  it("refuses a draft that only goes over the limit once line breaks are CRLF", () => {
    const draft = `${"a".repeat(MAX_NOTE_LENGTH - 1)}\nb`;
    expect(canSaveNote(draft)).toBe(false);
  });
});

describe("isNoteChanged", () => {
  it("is unchanged when the draft matches the saved body", () => {
    expect(isNoteChanged("hello", "hello")).toBe(false);
  });

  it("ignores surrounding whitespace, which saving trims", () => {
    expect(isNoteChanged("  hello \n", "hello")).toBe(false);
  });

  it("treats LF in the textarea and CRLF in the saved body as the same", () => {
    expect(isNoteChanged("one\ntwo", "one\r\ntwo")).toBe(false);
  });

  it("is changed when the text differs", () => {
    expect(isNoteChanged("hello there", "hello")).toBe(true);
  });

  it("is changed when there is no saved note and the draft has text", () => {
    expect(isNoteChanged("hello", "")).toBe(true);
  });

  it("is unchanged when there is no saved note and the draft is blank", () => {
    expect(isNoteChanged("   ", "")).toBe(false);
  });
});
