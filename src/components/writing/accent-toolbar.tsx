"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { insertTextAtCursor } from "@/lib/textarea-utils";

const ACCENT_CHARS = [
  "é", "è", "ê", "ë", "à", "â", "ù", "û", "ç", "î", "ï", "ô", "œ", "«", "»",
];

interface AccentToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsert?: () => void;
  className?: string;
}

export function AccentToolbar({ textareaRef, onInsert, className }: AccentToolbarProps) {
  const insertChar = useCallback(
    (char: string, e: React.MouseEvent) => {
      e.preventDefault(); // prevent textarea blur
      const textarea = textareaRef.current;
      if (!textarea) return;

      const finalChar = e.shiftKey ? char.toUpperCase() : char;
      insertTextAtCursor(textarea, finalChar);
      onInsert?.();
    },
    [textareaRef, onInsert],
  );

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 rounded-lg bg-muted/50 px-2 py-1.5",
        className,
      )}
      role="toolbar"
      aria-label="French accent characters"
    >
      {ACCENT_CHARS.map((char) => (
        <button
          key={char}
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary active:bg-primary/20"
          onMouseDown={(e) => insertChar(char, e)}
          title={`Insert ${char} (Shift+click for ${char.toUpperCase()})`}
          tabIndex={-1}
        >
          {char}
        </button>
      ))}
    </div>
  );
}
