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

const COLORS = ["yellow", "green", "blue", "pink", "purple", "orange"] as const;
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
  pink: "bg-pink-200/60 dark:bg-pink-800/40",
  purple: "bg-purple-200/60 dark:bg-purple-800/40",
  orange: "bg-orange-200/60 dark:bg-orange-800/40",
};

const COLOR_DOT: Record<string, string> = {
  yellow: "bg-yellow-400",
  green: "bg-green-400",
  blue: "bg-blue-400",
  pink: "bg-pink-400",
  purple: "bg-purple-400",
  orange: "bg-orange-400",
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
  const toolbarRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);

  // Load existing highlights
  useEffect(() => {
    if (!questionId || disabled) return;
    getHighlightsForQuestion(questionId)
      .then(setHighlights)
      .catch(() => {});
  }, [questionId, disabled]);

  // Compute overlay rects for highlights (no DOM mutation)
  const [overlayRects, setOverlayRects] = useState<
    { id: string; color: string; rects: DOMRect[]; highlight: HighlightItem }[]
  >([]);

  const computeOverlays = useCallback(() => {
    const container = containerRef.current;
    if (!container || disabled || highlights.length === 0) {
      setOverlayRects([]);
      return;
    }

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes: { node: Text; start: number; end: number }[] = [];
    let offset = 0;
    let tNode: Text | null;
    while ((tNode = walker.nextNode() as Text | null)) {
      textNodes.push({ node: tNode, start: offset, end: offset + tNode.length });
      offset += tNode.length;
    }
    const fullText = textNodes.map((tn) => tn.node.textContent).join("");

    const containerRect = container.getBoundingClientRect();
    const results: typeof overlayRects = [];

    for (const hl of highlights) {
      let hlStart = hl.start_offset;
      let hlEnd = hl.end_offset;

      const slice = fullText.slice(hlStart, hlEnd);
      if (slice !== hl.text) {
        const idx = fullText.indexOf(hl.text);
        if (idx === -1) continue;
        hlStart = idx;
        hlEnd = idx + hl.text.length;
      }

      // Build a Range covering this highlight
      const range = document.createRange();
      let rangeSet = false;

      for (const tn of textNodes) {
        const overlapStart = Math.max(tn.start, hlStart);
        const overlapEnd = Math.min(tn.end, hlEnd);
        if (overlapStart >= overlapEnd) continue;

        const localStart = overlapStart - tn.start;
        const localEnd = overlapEnd - tn.start;

        if (!rangeSet) {
          range.setStart(tn.node, localStart);
          rangeSet = true;
        }
        range.setEnd(tn.node, localEnd);
      }

      if (!rangeSet) continue;

      // Get client rects relative to container
      const clientRects = Array.from(range.getClientRects()).map((r) => new DOMRect(
        r.left - containerRect.left,
        r.top - containerRect.top,
        r.width,
        r.height,
      ));

      if (clientRects.length > 0) {
        results.push({ id: hl.id, color: hl.color, rects: clientRects, highlight: hl });
      }
    }

    setOverlayRects(results);
  }, [highlights, containerRef, disabled]);

  // Recompute overlays when highlights change or on resize/scroll
  useEffect(() => {
    computeOverlays();
    window.addEventListener("resize", computeOverlays);
    return () => window.removeEventListener("resize", computeOverlays);
  }, [computeOverlays]);

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

        // Position directly below the selected text
        const rect = range.getBoundingClientRect();
        setToolbar({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 4,
          text: text.slice(0, 500),
          startOffset,
          endOffset: startOffset + text.length,
        });
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
        });
        setHighlights((prev) => [...prev, hl]);
        setToolbar(null);
        window.getSelection()?.removeAllRanges();
        window.dispatchEvent(new Event("highlight-created"));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("409") || msg.includes("Duplicate")) {
          toast.info(t("review.highlights.deleted")); // reuse key
        } else {
          toast.error(t("common.errors.operationFailed"));
        }
      }
    },
    [toolbar, questionId, t],
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
      {/* Highlight overlays — absolute positioned colored divs */}
      {overlayRects.map((entry) =>
        entry.rects.map((rect, i) => (
          <div
            key={`${entry.id}-${i}`}
            className={cn(
              "absolute cursor-pointer rounded-sm pointer-events-auto",
              COLOR_BG[entry.color] || COLOR_BG.yellow,
            )}
            style={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setEditPopup({
                x: e.clientX,
                y: rect.top + (containerRef.current?.getBoundingClientRect().top || 0) - 8,
                highlight: entry.highlight,
              });
              setNoteText(entry.highlight.note || "");
              setEditingId(null);
              setToolbar(null);
            }}
          />
        )),
      )}

      {/* Create toolbar — only color dots, click = instant create */}
      {toolbar && (
        <div
          ref={toolbarRef}
          className="fixed z-50 flex items-center gap-0.5 rounded-full border bg-popover px-1.5 py-1 shadow-xl animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: toolbar.x,
            top: toolbar.y,
            transform: "translateX(-50%)",
          }}
        >
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => handleCreate(c)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
              title={c}
            >
              <span className={cn("h-5 w-5 rounded-full", COLOR_DOT[c])} />
            </button>
          ))}
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
            transform: "translateX(-50%)",
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
