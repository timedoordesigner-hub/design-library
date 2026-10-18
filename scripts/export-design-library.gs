/**
 * Export sheet -> JSON untuk Admin > Import data.
 * Pakai: tempel di file baru (mis. export.gs) > pilih fungsi exportJson > Run > buka Execution log.
 * Header (di baris mana saja dalam 30 baris pertama): No | Nama File | Category | Tipe Media | Link File | Keyword | Preview | Note
 * Tab dicari otomatis. Gambar: file Drive harus "Anyone with the link: Viewer".
 */
const EXPORT_SHEET_NAME = ""; // kosong = cari otomatis di semua tab
const EXPORT_PREVIEW_FOLDER_ID = ""; // opsional: folder gambar; dipakai jika chip tidak memberi URL (dicocokkan lewat nama file)

function exportFindHeader_(values) {
  const norm = (s) => String(s).trim().toLowerCase();
  for (let r = 0; r < Math.min(values.length, 30); r++) {
    const head = values[r].map(norm);
    if (head.indexOf("no") >= 0 && head.indexOf("nama file") >= 0) return { row: r, head };
  }
  return null;
}

// Smart chip Drive tidak terbaca getLinkUrl(); baca lewat Sheets API (Services > Sheets v4, sudah aktif). Hasil: {indeksBaris: url}
function exportChipUrls_(ss, sheet, colIdx) {
  const out = {};
  if (colIdx < 0) return out;
  try {
    const res = Sheets.Spreadsheets.get(ss.getId(), {
      ranges: ["'" + sheet.getName().replace(/'/g, "''") + "'"],
      fields: "sheets(data(startRow,rowData(values(chipRuns))))",
    });
    const data = res.sheets[0].data[0];
    const base = data.startRow || 0;
    (data.rowData || []).forEach((row, r) => {
      const cell = (row.values || [])[colIdx];
      for (const run of (cell && cell.chipRuns) || []) {
        const uri = run.chip && run.chip.richLinkProperties && run.chip.richLinkProperties.uri;
        if (uri) { out[base + r] = uri; break; }
      }
    });
  } catch (e) {
    Logger.log("Gagal baca chip via Sheets API: %s", e);
  }
  return out;
}

function exportJson() {
  const ss = SpreadsheetApp.getActive();
  const sheets = EXPORT_SHEET_NAME ? [ss.getSheetByName(EXPORT_SHEET_NAME)] : ss.getSheets();
  let sheet = null, range, values, found;
  for (const s of sheets) {
    if (!s || s.getLastRow() < 2) continue;
    range = s.getDataRange();
    values = range.getValues();
    found = exportFindHeader_(values);
    if (found) { sheet = s; break; }
  }
  if (!sheet) throw new Error("Header 'No' + 'Nama File' tidak ditemukan di tab mana pun. Cek EXPORT_SHEET_NAME / nama header.");

  const rich = range.getRichTextValues();
  const col = (name) => found.head.indexOf(name);
  const c = { no: col("no"), nama: col("nama file"), cat: col("category"), tipe: col("tipe media"), link: col("link file"), kw: col("keyword"), prev: col("preview"), note: col("note") };
  if (c.cat < 0 || c.tipe < 0) throw new Error("Header Category / Tipe Media tidak ditemukan.");

  const urlOf = (cell) => (cell ? cell.getLinkUrl() || cell.getRuns().map((r) => r.getLinkUrl()).find(Boolean) || "" : "");

  const chips = exportChipUrls_(ss, sheet, c.prev);

  const byName = {};
  if (EXPORT_PREVIEW_FOLDER_ID) {
    const files = DriveApp.getFolderById(EXPORT_PREVIEW_FOLDER_ID).getFiles();
    while (files.hasNext()) { const f = files.next(); byName[f.getName()] = f.getId(); }
  }

  const rows = [];
  let noImage = 0;
  for (let i = found.row + 1; i < values.length; i++) {
    const v = values[i];
    const no = Number(v[c.no]);
    if (!(no > 0) || !String(v[c.nama]).trim()) continue;
    const label = c.prev >= 0 ? String(v[c.prev]).trim() : "";
    let image = (c.prev >= 0 ? urlOf(rich[i][c.prev]) : "") || chips[i] || "";
    if (!image && label && byName[label]) image = byName[label];
    if (!image) noImage++;
    const link = c.link >= 0 ? urlOf(rich[i][c.link]) || String(v[c.link]).trim() : "";
    rows.push({
      sourceNo: no,
      nama: String(v[c.nama]).trim(),
      category: String(v[c.cat]).trim(),
      tipe: String(v[c.tipe]).trim(),
      link,
      keywords: c.kw >= 0 ? String(v[c.kw]).split(",").map((k) => k.trim()).filter(Boolean) : [],
      preview: label,
      note: c.note >= 0 ? String(v[c.note]).trim() : "",
      image, // importer mengubah URL Drive jadi thumbnail
    });
  }

  const file = DriveApp.createFile("design-library-export.json", JSON.stringify(rows, null, 1), MimeType.PLAIN_TEXT);
  Logger.log("Tab: %s. %s baris. Tanpa gambar: %s. File: %s", sheet.getName(), rows.length, noImage, file.getUrl());
}
