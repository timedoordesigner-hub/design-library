"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDesigns } from "./DesignsProvider";
import { useToast } from "./Toast";
import { planImport, type ParsedMd, type PlanRow } from "@/lib/importMd";
import { MAX_JSON_BYTES, parseSpreadsheetJson } from "@/lib/importSpreadsheet";

const statusLabel = { new: "Baru", update: "Update", skip: "Dilewati", error: "Error" } as const;

export function ImportForm() {
  const router = useRouter();
  const { designs, loading, importMany, removeAll } = useDesigns();
  const { showToast } = useToast();
  const jsonRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedMd[]>([]);
  const [overwrite, setOverwrite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [wiping, setWiping] = useState(false);

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
    if (file.size > MAX_JSON_BYTES) return showToast(`Ukuran JSON maksimal ${MAX_JSON_BYTES / 1024 / 1024} MB.`, "error");
    try { setRows(parseSpreadsheetJson(await file.text(), file.name)); }
    catch { showToast("File tidak bisa dibaca.", "error"); }
  };

  const submit = async () => {
    setSaving(true);
    try {
      const result = await importMany(rows, overwrite);
      showToast(`${result.added} ditambahkan${result.updated ? `, ${result.updated} diperbarui` : ""}.`);
      router.push("/library");
    } catch {
      showToast("Gagal menyimpan. Periksa koneksi atau login admin, lalu import ulang (aman diulang).", "error");
      setSaving(false);
    }
  };

  const wipe = async () => {
    setWiping(true);
    try {
      const n = await removeAll();
      setConfirm("");
      setRows([]);
      showToast(`${n} data dihapus.`);
    } catch {
      showToast("Gagal menghapus. Periksa koneksi atau login admin.", "error");
    }
    setWiping(false);
  };

  if (loading) return <main className="content-inner pb-16 pt-7"><div className="skeleton h-64" /></main>;

  return (
    <main className="content-inner pb-16 pt-7">
      <p className="eyebrow">Admin · Import</p>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">Import banyak data</h2>
      <p className="mt-1 text-[13px] text-muted">Upload satu JSON hasil Google Sheets untuk menambahkan data sekaligus.</p>

      <section className="form-card mt-6">
        <strong>Import dari Google Sheets (JSON)</strong>
        <p className="mt-1 text-[13px] text-muted">Satu file JSON hasil script <span className="mono">scripts/export-design-library.gs</span>. Gambar Drive harus dibagikan &quot;Anyone with the link&quot;.</p>
        <button type="button" className="control-button mt-3" onClick={() => jsonRef.current?.click()}>Pilih file JSON</button>
        <input ref={jsonRef} className="sr-only" type="file" accept=".json,application/json" onChange={(event) => { void readJson(event.target.files?.[0]); event.target.value = ""; }} />
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
          <div className="import-review" role="table" aria-label="Review import">
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
