"use client";

import { useEffect, useRef } from "react";

export function ConfirmDialog({ name, onCancel, onConfirm }: { name: string; onCancel: () => void; onConfirm: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onCancel();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onCancel]);

  return (
    <div className="confirm-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-copy">
        <p className="eyebrow text-warning">Delete file</p>
        <h2 id="confirm-title" className="mt-2 text-lg font-semibold">Delete “{name}”?</h2>
        <p id="confirm-copy" className="mt-2 text-[13px] text-muted">This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} className="control-button" onClick={onCancel}>Cancel</button>
          <button className="danger-button" onClick={onConfirm}>Delete</button>
        </div>
      </section>
    </div>
  );
}
