"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { useDesigns } from "./DesignsProvider";
import { useToast } from "./Toast";
import { MAX_FILE_BYTES, MAX_FILES, TEMPLATE, parseDesignMd, planImport, type ParsedMd, type PlanRow } from "@/lib/importMd";

const statusLabel = { new: "Baru", update: "Update", skip: "Dilewati", error: "Error" } as const;

export function ImportForm() {
  const router = useRouter();
  const { designs, loading, importMany } = useDesigns();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedMd[]>([]);
  const [overwrite, setOverwrite] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  const plan = useMemo(() => planImport(rows, designs, overwrite), [designs, overwrite, rows]);
  const counts = useMemo(() => ({
    new: plan.filter((row) => row.status === "new").length,
    update: plan.filter((row) => row.status === "update").length,
    skip: plan.filter((row) => row.status === "skip").length,
    error: plan.filter((row) => row.status === "error").length,
  }), [plan]);
  const valid = counts.new + counts.update;

  const readFiles = async (files: FileList | File[]) => {
    const selected = [...files];
    if (selected.length > MAX_FILES) {
      showToast(`Maksimal ${MAX_FILES} file per import.`, "error");
      return;
    }
    const parsed = await Promise.all(selected.map(async (file) => {
      if (file.size > MAX_FILE_BYTES) return { file: file.name, errors: [`Ukuran file maksimal ${MAX_FILE_BYTES / 1024} KB.`], warnings: [] } satisfies ParsedMd;
      try { return parseDesignMd(await file.text(), file.name); }
      catch { return { file: file.name, errors: ["File tidak bisa dibaca."], warnings: [] }; }
    }));
    setRows(parsed);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void readFiles(event.dataTransfer.files);
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "template-design.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const result = await importMany(rows, overwrite);
      showToast(`${result.added} ditambahkan${result.updated ? `, ${result.updated} diperbarui` : ""}.`);
      router.push("/library");
    } catch {
      showToast("Gagal menyimpan. Penyimpanan browser mungkin penuh.", "error");
      setSaving(false);
    }
  };

  if (loading) return <main className="content-inner pb-16 pt-7"><div className="skeleton h-64" /></main>;

  return (
    <main className="content-inner pb-16 pt-7">
      <p className="eyebrow">Admin · Import</p>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">Import banyak data</h2>
      <p className="mt-1 text-[13px] text-muted">Pilih banyak file Markdown dengan format front matter untuk menambahkan data sekaligus.</p>

      <section className="form-card mt-6">
        <div className={`md-dropzone ${dragging ? "is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
          <strong>Tarik file .md ke sini</strong>
          <span>atau pilih banyak file dari komputer</span>
          <button type="button" className="control-button" onClick={() => inputRef.current?.click()}>Pilih file Markdown</button>
          <input ref={inputRef} className="sr-only" type="file" multiple accept=".md,.markdown,text/markdown" onChange={(event) => { if (event.target.files) void readFiles(event.target.files); event.target.value = ""; }} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-muted">Satu file = satu data. Maksimal 500 file, 256 KB per file.</p>
          <button type="button" className="control-button" onClick={downloadTemplate}>Unduh template</button>
        </div>
      </section>

      {rows.length > 0 && (
        <section className="mt-6">
          <div className="import-summary" aria-live="polite">
            <span className="import-count import-count-new">{counts.new} Baru</span>
            <span className="import-count import-count-update">{counts.update} Update</span>
            <span className="import-count import-count-skip">{counts.skip} Dilewati</span>
            <span className="import-count import-count-error">{counts.error} Error</span>
          </div>
          <label className="import-overwrite"><input type="checkbox" checked={overwrite} onChange={(event) => setOverwrite(event.target.checked)} /> Timpa data dengan No yang sudah ada</label>
          <div className="import-review" role="table" aria-label="Review import Markdown">
            <div className="import-review-head" role="row"><span>Status</span><span>File</span><span>No</span><span>Nama dan kategori</span><span>Pesan</span></div>
            {plan.map((row, index) => <ReviewRow key={`${index}-${row.file}`} row={row} />)}
          </div>
          <div className="form-actions">
            <button type="button" className="control-button" onClick={() => setRows([])}>Ganti file</button>
            <button type="button" className="primary-button" disabled={!valid || saving} onClick={() => void submit()}>{saving ? "Mengimpor…" : `Import ${valid} file`}</button>
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
      <span><strong>{fields?.nama ?? "—"}</strong><small>{fields ? `${fields.category} / ${fields.subCategory} / ${fields.tipe}` : "Data belum lengkap"}</small></span>
      <span className={row.status === "error" ? "import-message-error" : "import-message"}>{row.messages.length ? row.messages.join(" ") : "Siap diimport."}</span>
    </div>
  );
}
