import { useState } from "react";
import { useFetcher } from "react-router";
import { Lock, NotebookPen } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { cn, formatRelativeTime } from "~/lib/utils";
import { canSaveNote, isNoteChanged, noteLength } from "~/modules/note-editor";
import type { LessonLoaderData } from "~/routes/courses.$slug.lessons.$lessonId";

type SavedNote = LessonLoaderData["note"];

const COUNTER_TONE = {
  normal: "text-muted-foreground",
  warning: "text-amber-600 dark:text-amber-500",
  over: "text-destructive",
} as const;

export function LessonNote({ note }: { note: SavedNote }) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const [draft, setDraft] = useState(note?.body ?? "");
  const isSaving = fetcher.state !== "idle";
  // An error describes the draft that was submitted; once the Student edits,
  // it no longer applies.
  const [submittedDraft, setSubmittedDraft] = useState<string | null>(null);
  const error = draft === submittedDraft ? fetcher.data?.error : undefined;
  const isDirty = isNoteChanged(draft, note?.body ?? "");

  return (
    <Card className="mb-8 gap-0 overflow-hidden py-0 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
      <NoteHeader />
      <fetcher.Form method="post" onSubmit={() => setSubmittedDraft(draft)}>
        <input type="hidden" name="intent" value="save-note" />
        <label htmlFor="lesson-note-body" className="sr-only">
          Your note on this lesson
        </label>
        <Textarea
          id="lesson-note-body"
          name="body"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-describedby="lesson-note-length"
          placeholder="Capture key ideas, questions, or anything you want to come back to."
          className="min-h-40 resize-y rounded-none border-0 px-5 py-4 leading-relaxed shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <div className="flex items-center gap-3 border-t bg-muted/40 px-5 py-3">
          <NoteStatus
            note={note}
            error={error}
            isDirty={isDirty}
            isSaving={isSaving}
          />
          <NoteCounter draft={draft} />
          <Button
            type="submit"
            size="sm"
            disabled={isSaving || !isDirty || !canSaveNote(draft)}
          >
            {isSaving ? "Saving..." : "Save note"}
          </Button>
        </div>
      </fetcher.Form>
    </Card>
  );
}

function NoteHeader() {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <NotebookPen className="size-4 text-muted-foreground" />
        Your note
      </h2>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Lock className="size-3" />
        Only visible to you
      </span>
    </div>
  );
}

function NoteStatus({
  note,
  error,
  isDirty,
  isSaving,
}: {
  note: SavedNote;
  error: string | undefined;
  isDirty: boolean;
  isSaving: boolean;
}) {
  if (error && !isSaving) {
    return (
      <span role="alert" className="mr-auto text-sm text-destructive">
        {error}
      </span>
    );
  }
  if (isDirty) {
    return (
      <span className="mr-auto text-xs text-muted-foreground">
        Unsaved changes
      </span>
    );
  }
  return (
    <span
      suppressHydrationWarning
      className="mr-auto text-xs text-muted-foreground"
    >
      {note ? `Saved ${formatRelativeTime(note.updatedAt)}` : ""}
    </span>
  );
}

function NoteCounter({ draft }: { draft: string }) {
  const { label, tone } = noteLength(draft);
  return (
    <span
      id="lesson-note-length"
      className={cn("text-xs tabular-nums", COUNTER_TONE[tone])}
    >
      {tone === "over" ? `Too long: ${label}` : label}
    </span>
  );
}
