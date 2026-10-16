/**
 * Export sheet -> JSON untuk Admin > Import data.
 * Pakai: Extensions > Apps Script > tempel > pilih fungsi exportJson > Run > buka Executions log / file di Drive.
 * Header baris 1 harus: No | Nama File | Category | Tipe Media | Link File | Keyword | Preview | Note
 * Gambar: file Drive harus "Anyone with the link: Viewer".
 */
const SHEET_NAME = ""; // kosong = sheet aktif
const PREVIEW_FOLDER_ID = ""; // opsional: folder gambar; dipakai jika chip tidak memberi URL (dicocokkan lewat nama file)

function exportJson() {
  const sheet = SHEET_NAME ? SpreadsheetApp.getActive().getSheetByName(SHEET_NAME) : SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();
  const rich = range.getRichTextValues();
  const head = values[0].map((h) => String(h).trim().toLowerCase());
  const col = (name) => head.indexOf(name);
  const c = { no: col("no"), nama: col("nama file"), cat: col("category"), tipe: col("tipe media"), link: col("link file"), kw: col("keyword"), prev: col("preview"), note: col("note") };
  if (c.no < 0 || c.nama < 0 || c.cat < 0 || c.tipe < 0) throw new Error("Header No / Nama File / Category / Tipe Media tidak ditemukan.");

  const byName = {};
  if (PREVIEW_FOLDER_ID) {
    const files = DriveApp.getFolderById(PREVIEW_FOLDER_ID).getFiles();
    while (files.hasNext()) { const f = files.next(); byName[f.getName()] = f.getId(); }
  }

  const rows = [];
  let noImage = 0;
  for (let i = 1; i < values.length; i++) {
    const v = values[i];
    if (!String(v[c.no]).trim() || !String(v[c.nama]).trim()) continue;
    const richCell = c.prev >= 0 ? rich[i][c.prev] : null;
    const label = c.prev >= 0 ? String(v[c.prev]).trim() : "";
    let image = "";
    if (richCell) {
      const url = richCell.getLinkUrl() || (richCell.getRuns().map((r) => r.getLinkUrl()).find(Boolean) || "");
      image = url; // importer mengubah URL Drive jadi thumbnail
    }
    if (!image && label && byName[label]) image = byName[label];
    if (!image) noImage++;
    // Link Figma: ambil URL dari hyperlink jika teks sel terpotong.
    const linkRich = c.link >= 0 ? rich[i][c.link] : null;
    const link = (linkRich && linkRich.getLinkUrl()) || (c.link >= 0 ? String(v[c.link]).trim() : "");
    rows.push({
      sourceNo: Number(v[c.no]),
      nama: String(v[c.nama]).trim(),
      category: String(v[c.cat]).trim(),
      tipe: String(v[c.tipe]).trim(),
      link,
      keywords: c.kw >= 0 ? String(v[c.kw]).split(",").map((k) => k.trim()).filter(Boolean) : [],
      preview: label,
      note: c.note >= 0 ? String(v[c.note]).trim() : "",
      image,
    });
  }

  const file = DriveApp.createFile("design-library-export.json", JSON.stringify(rows, null, 1), MimeType.PLAIN_TEXT);
  Logger.log("%s baris. Tanpa gambar: %s. File: %s", rows.length, noImage, file.getUrl());
}
