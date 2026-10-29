"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Design } from "@/lib/designs";
import Link from "next/link";
import { Thumb } from "./Thumb";
import { PencilIcon, TrashIcon } from "./Icons";
import { toneOf } from "@/lib/taxonomy";
import { useAuth } from "./AuthProvider";
import { useDesigns } from "./DesignsProvider";
import { similarTo } from "@/lib/similar";

type Props = {
  designs: Design[];
  activeId: number;
  onClose: () => void;
  onNavigate: (id: number) => void;
  onDelete?: (design: Design) => void;
};

export function Viewer({ designs, activeId, onClose, onNavigate, onDelete }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { isAdmin } = useAuth();
  const { designs: pool } = useDesigns();
  const activeIndex = designs.findIndex((design) => design.id === activeId);
  const design = designs[activeIndex];

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && activeIndex > 0) onNavigate(designs[activeIndex - 1].id);
      if (event.key === "ArrowRight" && activeIndex < designs.length - 1) onNavigate(designs[activeIndex + 1].id);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, designs, onClose, onNavigate]);

  const similar = useMemo(() => (design ? similarTo(design, pool) : []), [design, pool]);

  if (!design) return null;

  return (
    <div className="viewer-backdrop fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
      <div className="viewer-panel flex max-h-[calc(100vh-20px)] w-full max-w-6xl flex-col sm:max-h-[calc(100vh-48px)] sm:flex-row">
        <div className="viewer-main flex min-h-0 flex-1 flex-col">
          <div className="viewer-canvas relative flex min-h-[42vh] flex-1 items-center justify-center p-5 sm:min-h-0 sm:p-10">
            <div className="w-full max-w-3xl"><Thumb design={design} /></div>
            <button className="viewer-close absolute right-3 top-3 h-8 w-8 text-lg leading-none" ref={closeRef} onClick={onClose} aria-label="Close viewer">×</button>
            <button className="viewer-nav viewer-nav-left" onClick={() => activeIndex > 0 && onNavigate(designs[activeIndex - 1].id)} disabled={activeIndex <= 0} aria-label="Previous design">←</button>
            <button className="viewer-nav viewer-nav-right" onClick={() => activeIndex < designs.length - 1 && onNavigate(designs[activeIndex + 1].id)} disabled={activeIndex >= designs.length - 1} aria-label="Next design">→</button>
          </div>
          {similar.length > 0 && (
            <section className="viewer-similar-bar" aria-labelledby="similar-title">
              <h3 id="similar-title" className="viewer-label">Similar designs</h3>
              <ul className="viewer-similar">
                {similar.map((item) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => onNavigate(item.id)} title={item.nama}>
                      <Thumb design={item} compact />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside key={design.id} className="w-full shrink-0 overflow-y-auto border-t border-line p-5 sm:w-80 sm:border-l sm:border-t-0 sm:p-7">
          <div className="mb-10 flex items-start justify-between gap-4"><p className="eyebrow">{String(activeIndex + 1).padStart(2, "0")} / {String(designs.length).padStart(2, "0")}</p><p className="mono text-[10px] text-muted">ESC</p></div>
          <p className="eyebrow" style={{ color: toneOf(design.category).accent }}>{design.category}</p>
          <h2 id="viewer-title" className="mt-2 text-xl font-semibold leading-tight tracking-[-0.02em]">{design.nama}</h2>
          <dl className="mt-8 space-y-5 border-t border-line pt-5">
            <div><dt className="viewer-label">Media type</dt><dd className="mt-1 text-sm text-muted">{design.tipe}</dd></div>
            <div><dt className="viewer-label">Keyword</dt><dd className="mt-1 text-sm leading-relaxed text-muted">{design.keywords.join(", ") || "—"}</dd></div>
            <div><dt className="viewer-label">Preview</dt><dd className="mt-1 break-words text-xs text-muted">{design.preview || "—"}</dd></div>
          </dl>
          <div className="mt-10 flex flex-wrap items-center gap-2">
          {design.link && <a href={design.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dark">Open in Figma <span aria-hidden="true">↗</span></a>}
          {isAdmin && <Link href={`/edit/${design.id}`} className="viewer-action viewer-action-edit"><PencilIcon />Edit</Link>}
          {isAdmin && onDelete && <button type="button" className="viewer-action viewer-action-delete" onClick={() => onDelete(design)}><TrashIcon />Delete</button>}
        </div>
        </aside>
      </div>
    </div>
  );
}
