/**
 * Export sheet -> JSON untuk Admin > Import data.
 * Pakai: tempel di file baru (mis. export.gs) > pilih fungsi exportJson > Run > buka Execution log.
 * Header (di baris mana saja dalam 30 baris pertama): No | Nama File | LINK FIGMA (atau Link File) | opsional: Category | Tipe Media | Keyword | Preview | Note
 * Category/Tipe Media kosong/tidak ada = ditebak dari judul. Gambar: file "<No>.png" di EXPORT_PREVIEW_FOLDER_ID.
 * Tab dicari otomatis. Gambar: file Drive harus "Anyone with the link: Viewer".
 */
const EXPORT_SHEET_NAME = ""; // kosong = cari otomatis di semua tab
const EXPORT_PREVIEW_FOLDER_ID = "1Ee_aB4oO_bFj42cCdtOJOqFWqN8O_qG9"; // file No 1 -> 1.png, dst.
const EXPORT_NO_OFFSET = 527; // No 514-527 sudah terpakai; sheet 1 sekarang menjadi web No 528. Nama gambar tetap memakai No sheet.

// ponytail: tebakan dari judul (aturan pertama yang cocok menang). Ceiling: akurasi sedang; tambah kolom Category/Tipe Media di sheet untuk menimpa.
const EXPORT_TIPE_RULES_ = [
  [/sticker/, "Sticker"], [/keychain/, "Keychain"], [/tas serut/, "Bag"],
  [/certif|sertifikat/, "Certificate"], [/report card/, "Report Card"], [/voucher/, "voucher"],
  [/x-?\s?banner|standing banner/, "Standing Banner (X-Banner)"], [/umbul/, "Umbul-Umbul / Flag"],
  [/banner/, "Banner"], [/booth/, "Booth Design"], [/medal|mendali/, "Medali"],
  [/ppt|company profile|roadmap/, "Presentation"], [/booklet|catalog/, "Booklet"],
  [/\bads\b/, "Ads"], [/carousel|\big\b|\bpost\b|story|twibbon|testimoni|testimony|video|aftermovie/, "Social Media"],
  [/poster|infographic/, "Poster"], [/pamflet/, "Pamflet Lipat"], [/flyer/, "Flyer"],
];
const EXPORT_CAT_RULES_ = [
  [/tas serut|sticker|keychain|merch/, "Merchandise"],
  [/promo|diskon|referral|trial|campaign|voucher/, "Campaign"],
  [/partnership|kerjasama|kolaborasi|siplah|wood school|medikids/, "Partnership"],
  [/anniversary|branch opening|aftermovie/, "Branch"],
  [/event|camp|workshop|bootcamp|skill\s?lab|life skill|ycwc|greetings|lomba|family day|summit|open house|booth|showcase|cyber xperience|car free day|seminar/, "Event"],
  [/roadmap|course|class|playschool|coding|\bai\b|english|curriculum|learning path|tutor|python|roblox|program/, "Courses"],
];
function exportGuess_(rules, nama, fallback) {
  const s = nama.toLowerCase();
  const hit = rules.find((r) => r[0].test(s));
  return hit ? hit[1] : fallback;
}

function exportKeywords_(nama, category, tipe) {
  const s = nama.toLowerCase().replace(/[–—]/g, "-");
  const stop = new Set([
    "design", "the", "and", "for", "of", "at", "in", "to", "a", "an",
    "with", "by", "on", "from", "timedoor", "academy", "resize", "edit",
    "revisi", "adjustment", "new", "template", "option", "opsi",
  ]);
  const out = [];
  const add = (value) => {
    const word = String(value).trim().toLowerCase();
    if (word && !stop.has(word) && !out.includes(word)) out.push(word);
  };

  s.split(/[^a-z0-9]+/).forEach((word) => {
    if (word.length > 2) add(word);
  });
  add(category);
  add(tipe);

  const aliases = [
    [/flyer|e-flyer/, ["flyer", "digital flyer", "promotional material", "promotion"]],
    [/poster/, ["poster", "promotional poster", "print design", "digital poster"]],
    [/carousel|\bpost\b|story|ig|instagram|twibbon|testimoni|testimony/, ["social media", "instagram", "social media post", "content"]],
    [/ads|meta/, ["ads", "advertisement", "digital advertising", "marketing"]],
    [/event|camp|workshop|bootcamp|seminar|summit|showcase|anniversary|open house|family day|lomba|greetings/, ["event", "event promotion", "announcement"]],
    [/coding|programming|ai|python|robot|curriculum|learning|course|class|playschool|english|tutor/, ["education", "course", "learning", "technology", "children education"]],
    [/branch|cabang|opening|maintenance|interior|exterior/, ["branch", "branch branding", "offline branding"]],
    [/promo|discount|diskon|referral|trial|voucher|campaign/, ["campaign", "promotion", "promo", "offer"]],
    [/partnership|kerjasama|kolaborasi|partner/, ["partnership", "collaboration", "school partnership"]],
    [/sticker/, ["sticker", "merchandise", "branding material"]],
    [/keychain/, ["keychain", "merchandise", "souvenir"]],
    [/banner|x-banner|standing/, ["banner", "outdoor advertising", "print material"]],
    [/certificate|certif|sertifikat/, ["certificate", "achievement", "award"]],
  ];
  aliases.forEach(([pattern, words]) => {
    if (pattern.test(s)) words.forEach(add);
  });
  return out.slice(0, 18);
}

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
  const c = { no: col("no"), nama: col("nama file"), cat: col("category"), tipe: col("tipe media"), link: Math.max(col("link file"), col("link figma")), kw: col("keyword"), prev: col("preview"), note: col("note") };

  const urlOf = (cell) => (cell ? cell.getLinkUrl() || cell.getRuns().map((r) => r.getLinkUrl()).find(Boolean) || "" : "");

  const chips = exportChipUrls_(ss, sheet, c.prev);

  const byName = {};
  if (EXPORT_PREVIEW_FOLDER_ID) {
    const files = DriveApp.getFolderById(EXPORT_PREVIEW_FOLDER_ID).getFiles();
    while (files.hasNext()) { const f = files.next(); byName[f.getName()] = f.getId(); }
  }

  const rows = [];
  let noImage = 0;
  const skipped = [];
  for (let i = found.row + 1; i < values.length; i++) {
    const v = values[i];
    const no = Number(v[c.no]);
    const nama = String(v[c.nama]).trim();
    if (!(no > 0) || !nama) {
      if (nama || String(v[c.no]).trim()) skipped.push("baris " + (i + 1) + ": No=[" + v[c.no] + "] Nama=[" + nama.slice(0, 30) + "]");
      continue;
    }
    const label = c.prev >= 0 ? String(v[c.prev]).trim() : "";
    const numberedName = no + ".png";
    let image = (c.prev >= 0 ? urlOf(rich[i][c.prev]) : "") || chips[i] || "";
    if (!image && byName[numberedName]) image = byName[numberedName];
    if (!image && label && byName[label]) image = byName[label];
    if (!image) noImage++;
    const link = c.link >= 0 ? urlOf(rich[i][c.link]) || String(v[c.link]).trim() : "";
    rows.push({
      sourceNo: no + EXPORT_NO_OFFSET,
      nama: String(v[c.nama]).trim(),
      category: (c.cat >= 0 && String(v[c.cat]).trim()) || exportGuess_(EXPORT_CAT_RULES_, nama, "Marketing"),
      tipe: (c.tipe >= 0 && String(v[c.tipe]).trim()) || exportGuess_(EXPORT_TIPE_RULES_, nama, "Flyer"),
      link,
      keywords: c.kw >= 0 && String(v[c.kw]).trim()
        ? String(v[c.kw]).split(",").map((k) => k.trim()).filter(Boolean)
        : exportKeywords_(nama, (c.cat >= 0 && String(v[c.cat]).trim()) || exportGuess_(EXPORT_CAT_RULES_, nama, "Marketing"), (c.tipe >= 0 && String(v[c.tipe]).trim()) || exportGuess_(EXPORT_TIPE_RULES_, nama, "Flyer")),
      preview: label,
      note: c.note >= 0 ? String(v[c.note]).trim() : "",
      image, // importer mengubah URL Drive jadi thumbnail
    });
  }

  const file = DriveApp.createFile("design-library-export.json", JSON.stringify(rows, null, 1), MimeType.PLAIN_TEXT);
  if (skipped.length) Logger.log("DILEWATI %s baris:\n%s", skipped.length, skipped.join("\n"));
  const nos = rows.map((r) => r.sourceNo);
  const dups = nos.filter((n, k) => nos.indexOf(n) !== k);
  if (dups.length) Logger.log("No DUPLIKAT (hanya yang pertama diimport): %s", dups.join(", "));
  Logger.log("Tab: %s. %s baris. Tanpa gambar: %s. File: %s", sheet.getName(), rows.length, noImage, file.getUrl());
}
