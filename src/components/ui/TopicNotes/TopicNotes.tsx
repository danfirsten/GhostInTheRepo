"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { NotePencil, FloppyDisk, Check, X } from "@phosphor-icons/react";
import { useAuth } from "@/lib/hooks/useAuth";
import styles from "./TopicNotes.module.css";

interface TopicNotesProps {
  contentType: "topic" | "codex" | "cheatsheet";
  contentSlug: string;
  domainSlug?: string;
}

type SaveStatus = "idle" | "saving" | "saved";

export function TopicNotes({
  contentType,
  contentSlug,
  domainSlug,
}: TopicNotesProps) {
  const { user, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [fetching, setFetching] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch existing note on mount
  useEffect(() => {
    if (!user) {
      setFetching(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    async function fetchNote() {
      try {
        const params = new URLSearchParams({
          content_type: contentType,
          content_slug: contentSlug,
        });
        const res = await fetch(`/api/user/notes?${params}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setNoteText(data.note_text ?? "");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      } finally {
        setFetching(false);
      }
    }

    fetchNote();

    return () => {
      controller.abort();
    };
  }, [user, contentType, contentSlug]);

  // Save note to API
  const saveNote = useCallback(
    async (text: string) => {
      setSaveStatus("saving");
      try {
        const res = await fetch("/api/user/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_type: contentType,
            content_slug: contentSlug,
            domain_slug: domainSlug ?? null,
            note_text: text,
          }),
        });
        if (res.ok) {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } else {
          setSaveStatus("idle");
        }
      } catch {
        setSaveStatus("idle");
      }
    },
    [contentType, contentSlug, domainSlug]
  );

  // Handle text change with debounced auto-save
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setNoteText(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        saveNote(value);
      }, 1500);
    },
    [saveNote]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Don't render for unauthenticated users or while loading
  if (!user && !authLoading) return null;
  if (authLoading) return null;

  return (
    <>
      {/* Floating toggle button — always visible */}
      <button
        className={`${styles.fab} ${open ? styles.fabHidden : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Open notes"
        title="Your Notes"
      >
        <NotePencil size={22} weight="duotone" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className={styles.backdrop}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out drawer */}
      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        aria-label="Personal notes"
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>
            <NotePencil size={18} weight="duotone" />
            Your Notes
          </span>
          <button
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label="Close notes"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className={styles.drawerBody}>
          {fetching ? (
            <div className={styles.skeleton}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
            </div>
          ) : (
            <>
              <textarea
                className={styles.textarea}
                value={noteText}
                onChange={handleChange}
                placeholder="Add your personal notes for this topic..."
                spellCheck
              />
              <div className={styles.footer}>
                <span className={styles.saveStatus}>
                  {saveStatus === "saving" && (
                    <>
                      <FloppyDisk size={14} weight="duotone" />
                      <span>Saving...</span>
                    </>
                  )}
                  {saveStatus === "saved" && (
                    <span className={styles.saved}>
                      <Check size={14} weight="bold" />
                      <span>Saved</span>
                    </span>
                  )}
                </span>
                <span className={styles.charCount}>
                  {noteText.length.toLocaleString()} chars
                </span>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
