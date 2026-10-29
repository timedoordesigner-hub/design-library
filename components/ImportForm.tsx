"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDesigns } from "./DesignsProvider";
import { useToast } from "./Toast";
import { planImport, type ParsedMd, type PlanRow } from "@/lib/importMd";
import { MAX_JSON_BYTES, parseSpreadsheetJson } from "@/lib/importSpreadsheet";

const statusLabel = { new: "New", update: "Update", skip: "Skipped", error: "Error" } as const;

export function ImportForm() {
  const router = useRouter();
  const { designs, loading, importMany } = useDesigns();
  const { showToast } = useToast();
  const jsonRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedMd[]>([]);
  const [overwrite, setOverwrite] = useState(false);
  const [saving, setSaving] = useState(false);

  const plan = useMemo(() => planImport(rows, designs, overwrite), [designs, overwrite, rows]);
  const counts = useMemo(() => ({
    new: plan.filter((row) => row.status === "new").length,
    update: plan.filter((row) => row.status === "update").length,
    skip: plan.filter((row) => row.status === "skip").length,
    error: plan.filter((row) => row.status === "error").length,
  }), [plan]);
  const valid = counts.new + counts.update;

  const readJson = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_JSON_BYTES) return showToast(`JSON file must be ${MAX_JSON_BYTES / 1024 / 1024} MB or less.`, "error");
    try { setRows(parseSpreadsheetJson(await file.text(), file.name)); }
    catch { showToast("File could not be read.", "error"); }
  };

  const submit = async () => {
    setSaving(true);
    try {
      const result = await importMany(rows, overwrite);
      showToast(`${result.added} added${result.updated ? `, ${result.updated} updated` : ""}.`);
      router.push("/library");
    } catch {
      showToast("Could not save. Check your connection or admin login, then import again (safe to repeat).", "error");
      setSaving(false);
    }
  };

  if (loading) return <main className="content-inner pb-16 pt-7"><div className="skeleton h-64" /></main>;

  return (
    <main className="content-inner pb-16 pt-7">
      <p className="eyebrow">Admin · Import</p>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">Bulk import</h2>
      <p className="mt-1 text-[13px] text-muted">Upload one JSON file exported from Google Sheets to add many designs at once.</p>

      <section className="form-card mt-6">
        <strong>Import from Google Sheets (JSON)</strong>
        <p className="mt-1 text-[13px] text-muted">One JSON file from the <span className="mono">scripts/export-design-library.gs</span> script. Drive images must be shared as &quot;Anyone with the link&quot;.</p>
        <button type="button" className="control-button mt-3" onClick={() => jsonRef.current?.click()}>Choose JSON file</button>
        <input ref={jsonRef} className="sr-only" type="file" accept=".json,application/json" onChange={(event) => { void readJson(event.target.files?.[0]); event.target.value = ""; }} />
      </section>

      {rows.length > 0 && (
        <section className="mt-6">
          <div className="import-summary" aria-live="polite">
            <span className="import-count import-count-new">{counts.new} New</span>
            <span className="import-count import-count-update">{counts.update} Update</span>
            <span className="import-count import-count-skip">{counts.skip} Skipped</span>
            <span className="import-count import-count-error">{counts.error} Error</span>
          </div>
          <label className="import-overwrite"><input type="checkbox" checked={overwrite} onChange={(event) => setOverwrite(event.target.checked)} /> Overwrite existing designs with the same No.</label>
          <div className="import-review" role="table" aria-label="Import review">
            <div className="import-review-head" role="row"><span>Status</span><span>File</span><span>No</span><span>Name and category</span><span>Message</span></div>
            {plan.map((row, index) => <ReviewRow key={`${index}-${row.file}`} row={row} />)}
          </div>
          <div className="form-actions">
            <button type="button" className="control-button" onClick={() => setRows([])}>Change file</button>
            <button type="button" className="primary-button" disabled={!valid || saving} onClick={() => void submit()}>{saving ? "Importing…" : `Import ${valid} ${valid === 1 ? "file" : "files"}`}</button>
          </div>
        </section>
      )}
    </main>
  );
}

function ReviewRow({ row }: { row: PlanRow }) {
  const fields = row.fields;
  return (
    <div className="import-review-row" role="row">
      <span><b className={`import-status import-status-${row.status}`}>{statusLabel[row.status]}</b></span>
      <span className="import-file" title={row.file}>{row.file}</span>
      <span className="mono">{fields?.sourceNo ?? "—"}</span>
      <span><strong>{fields?.nama ?? "—"}</strong><small>{fields ? `${fields.category} / ${fields.tipe}` : "Incomplete data"}</small></span>
      <span className={row.status === "error" ? "import-message-error" : "import-message"}>{row.messages.length ? row.messages.join(" ") : "Ready to import."}</span>
    </div>
  );
}
