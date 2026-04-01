"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  createHighlight,
  getHighlightsForQuestion,
  updateHighlight,
  deleteHighlight,
} from "@/lib/api/highlights";
import type { HighlightItem } from "@/lib/api/types";

const COLORS = ["yellow", "green", "blue"] as const;
const TAGS = [
  "collocation",
  "expression",
  "connector",
  "grammar",
  "vocabulary",
  "confusing",
  "exam_key",
] as const;

const COLOR_BG: Record<string, string> = {
  yellow: "bg-yellow-200/60 dark:bg-yellow-800/40",
  green: "bg-green-200/60 dark:bg-green-800/40",
  blue: "bg-blue-200/60 dark:bg-blue-800/40",
};

const COLOR_DOT: Record<string, string> = {
  yellow: "bg-yellow-400",
  green: "bg-green-400",
  blue: "bg-blue-400",
};

interface HighlightToolbarProps {
  questionId: string;
  /** Ref to the passage container DOM element */
  containerRef: React.RefObject<HTMLDivElement | null>;
  disabled?: boolean;
}

export function HighlightToolbar({
  questionId,
  containerRef,
  disabled,
}: HighlightToolbarProps) {
  const t = useTranslations();
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [toolbar, setToolbar] = useState<{
    x: number;
    y: number;
    text: string;
    startOffset: number;
    endOffset: number;
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPopup, setEditPopup] = useState<{
    x: number;
    y: number;
    highlight: HighlightItem;
  } | null>(null);
  const [noteText, setNoteText] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const toolbarRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);

  // Load existing highlights
  useEffect(() => {
    if (!questionId || disabled) return;
    getHighlightsForQuestion(questionId)
      .then(setHighlights)
      .catch(() => {});
  }, [questionId, disabled]);

  // Apply highlight marks to the DOM
  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    // Clear existing marks
    container.querySelectorAll("mark[data-hl-id]").forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
    });

    if (highlights.length === 0) return;

    // Get the full text content and build a text-to-node map
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes: { node: Text; start: number; end: number }[] = [];
    let offset = 0;
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      textNodes.push({ node, start: offset, end: offset + node.length });
      offset += node.length;
    }
    const fullText = textNodes.map((t) => t.node.textContent).join("");

    // Apply each highlight
    const sorted = [...highlights].sort(
      (a, b) => b.start_offset - a.start_offset,
    );
    for (const hl of sorted) {
      // Try exact offset first
      let hlStart = hl.start_offset;
      let hlEnd = hl.end_offset;

      // Verify text matches, fallback to text search
      const slice = fullText.slice(hlStart, hlEnd);
      if (slice !== hl.text) {
        const idx = fullText.indexOf(hl.text);
        if (idx === -1) continue;
        hlStart = idx;
        hlEnd = idx + hl.text.length;
      }

      // Find text nodes that overlap with this highlight range
      for (let i = textNodes.length - 1; i >= 0; i--) {
        const tn = textNodes[i];
        const overlapStart = Math.max(tn.start, hlStart);
        const overlapEnd = Math.min(tn.end, hlEnd);
        if (overlapStart >= overlapEnd) continue;

        const localStart = overlapStart - tn.start;
        const localEnd = overlapEnd - tn.start;
        const textContent = tn.node.textContent || "";

        const before = textContent.slice(0, localStart);
        const marked = textContent.slice(localStart, localEnd);
        const after = textContent.slice(localEnd);

        const mark = document.createElement("mark");
        mark.setAttribute("data-hl-id", hl.id);
        mark.className = `cursor-pointer rounded-sm ${COLOR_BG[hl.color] || COLOR_BG.yellow}`;
        mark.textContent = marked;
        mark.addEventListener("click", (e) => {
          e.stopPropagation();
          const rect = mark.getBoundingClientRect();
          setEditPopup({
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
            highlight: hl,
          });
          setNoteText(hl.note || "");
          setEditingId(null);
          setToolbar(null);
        });

        const parent = tn.node.parentNode;
        if (!parent) continue;

        if (after) {
          parent.insertBefore(document.createTextNode(after), tn.node.nextSibling);
        }
        parent.insertBefore(mark, tn.node.nextSibling);
        if (before) {
          tn.node.textContent = before;
        } else {
          parent.removeChild(tn.node);
        }
      }
    }
  }, [highlights, containerRef, disabled]);

  // Listen for text selection
  useEffect(() => {
    if (disabled) return;
    const container = containerRef.current;
    if (!container) return;

    const handleMouseUp = () => {
      // Small delay to let selection finalize
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.rangeCount) {
          return;
        }

        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();
        if (text.length < 2) return;

        // Verify selection is within our container
        if (!container.contains(range.commonAncestorContainer)) return;

        // Calculate offset relative to the container's full text
        const preRange = document.createRange();
        preRange.selectNodeContents(container);
        preRange.setEnd(range.startContainer, range.startOffset);
        const startOffset = preRange.toString().length;

        // Position above the start of the selection
        const rects = range.getClientRects();
        const firstRect = rects[0] || range.getBoundingClientRect();
        const lastRect = rects[rects.length - 1] || firstRect;
        setToolbar({
          x: (firstRect.left + lastRect.right) / 2,
          y: firstRect.top - 8,
          text: text.slice(0, 500),
          startOffset,
          endOffset: startOffset + text.length,
        });
        setSelectedTags(new Set());
        setEditPopup(null);
      }, 10);
    };

    container.addEventListener("mouseup", handleMouseUp);
    return () => container.removeEventListener("mouseup", handleMouseUp);
  }, [containerRef, disabled]);

  // Close toolbars when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        setToolbar(null);
      }
      if (
        editRef.current &&
        !editRef.current.contains(e.target as Node)
      ) {
        setEditPopup(null);
        setEditingId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCreate = useCallback(
    async (color: string = "yellow") => {
      if (!toolbar) return;
      try {
        const hl = await createHighlight({
          question_id: questionId,
          text: toolbar.text,
          start_offset: toolbar.startOffset,
          end_offset: toolbar.endOffset,
          color,
          tags: Array.from(selectedTags),
        });
        setHighlights((prev) => [...prev, hl]);
        setToolbar(null);
        window.getSelection()?.removeAllRanges();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("409") || msg.includes("Duplicate")) {
          toast.info(t("review.highlights.deleted")); // reuse key
        } else {
          toast.error(t("common.errors.operationFailed"));
        }
      }
    },
    [toolbar, questionId, selectedTags, t],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteHighlight(id);
        setHighlights((prev) => prev.filter((h) => h.id !== id));
        setEditPopup(null);
        toast.success(t("review.highlights.deleted"));
      } catch {
        toast.error(t("common.errors.operationFailed"));
      }
    },
    [t],
  );

  const handleColorChange = useCallback(
    async (id: string, color: string) => {
      try {
        await updateHighlight(id, { color });
        setHighlights((prev) =>
          prev.map((h) =>
            h.id === id ? { ...h, color: color as HighlightItem["color"] } : h,
          ),
        );
        setEditPopup((prev) =>
          prev ? { ...prev, highlight: { ...prev.highlight, color: color as HighlightItem["color"] } } : null,
        );
      } catch {
        toast.error(t("common.errors.operationFailed"));
      }
    },
    [t],
  );

  const handleTagsChange = useCallback(
    async (id: string, tags: string[]) => {
      try {
        await updateHighlight(id, { tags });
        setHighlights((prev) =>
          prev.map((h) => (h.id === id ? { ...h, tags } : h)),
        );
        setEditPopup((prev) =>
          prev ? { ...prev, highlight: { ...prev.highlight, tags } } : null,
        );
      } catch {
        toast.error(t("common.errors.operationFailed"));
      }
    },
    [t],
  );

  const handleSaveNote = useCallback(
    async (id: string) => {
      try {
        const note = noteText.trim() || null;
        await updateHighlight(id, { note });
        setHighlights((prev) =>
          prev.map((h) => (h.id === id ? { ...h, note } : h)),
        );
        setEditingId(null);
      } catch {
        toast.error(t("common.errors.operationFailed"));
      }
    },
    [noteText, t],
  );

  if (disabled) return null;

  return (
    <>
      {/* Create toolbar — appears on text selection */}
      {toolbar && (
        <div
          ref={toolbarRef}
          className="fixed z-50 w-72 rounded-xl border bg-popover p-2.5 shadow-xl animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: toolbar.x,
            top: toolbar.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          {/* Color buttons */}
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => handleCreate(c)}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                title={c}
              >
                <span className={cn("h-5 w-5 rounded-full", COLOR_DOT[c])} />
              </button>
            ))}
          </div>
          {/* Tag pills */}
          <div className="mt-2 flex flex-wrap gap-1">
            {TAGS.map((tag) => {
              const active = selectedTags.has(tag);
              return (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTags((prev) => {
                      const next = new Set(prev);
                      if (active) next.delete(tag); else next.add(tag);
                      return next;
                    });
                  }}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {t(`review.highlights.tags.${tag}`)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit popup — appears on clicking an existing highlight */}
      {editPopup && (
        <div
          ref={editRef}
          className="fixed z-50 w-72 rounded-xl border bg-popover p-3 shadow-xl animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: editPopup.x,
            top: editPopup.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          {/* Color picker + actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorChange(editPopup.highlight.id, c)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted",
                    editPopup.highlight.color === c && "ring-2 ring-primary ring-offset-2",
                  )}
                >
                  <span className={cn("h-5 w-5 rounded-full", COLOR_DOT[c])} />
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setEditingId(editPopup.highlight.id);
                  setNoteText(editPopup.highlight.note || "");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                title={t("review.highlights.addNote")}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(editPopup.highlight.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-100 hover:text-destructive dark:hover:bg-red-900/30"
                title={t("review.highlights.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setEditPopup(null); setEditingId(null); }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tag pills */}
          <div className="mt-2 flex flex-wrap gap-1">
            {TAGS.map((tag) => {
              const active = (editPopup.highlight.tags || []).includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    const current = editPopup.highlight.tags || [];
                    const newTags = active
                      ? current.filter((t: string) => t !== tag)
                      : [...current, tag];
                    handleTagsChange(editPopup.highlight.id, newTags);
                  }}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {t(`review.highlights.tags.${tag}`)}
                </button>
              );
            })}
          </div>

          {/* Note editor */}
          {editingId === editPopup.highlight.id && (
            <div className="mt-3 space-y-2">
              <textarea
                value={noteText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNoteText(e.target.value)}
                placeholder={t("review.highlights.notePlaceholder")}
                className="min-h-[70px] w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={1000}
                autoFocus
              />
              <button
                onClick={() => handleSaveNote(editPopup.highlight.id)}
                className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {t("review.highlights.save")}
              </button>
            </div>
          )}

          {/* Show existing note */}
          {!editingId && editPopup.highlight.note && (
            <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {editPopup.highlight.note}
            </p>
          )}
        </div>
      )}
    </>
  );
}
