"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";
import { validUrl, type Design } from "@/lib/designs";
import { removePreview, uploadPreview } from "@/lib/store";
import { categoryGroups, categoryNames, mediaTypes } from "@/lib/taxonomy";
import { useDesigns, type DesignFields } from "./DesignsProvider";
import { ImageIcon, InfoIcon } from "./Icons";
import { useToast } from "./Toast";

const MAX_BYTES = 5 * 1024 * 1024;

type Errors = Partial<Record<"nama" | "category" | "subCategory" | "tipe" | "link" | "sourceNo" | "image", string>>;

function readImage(file: File): Promise<{ url: string; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const url = String(reader.result);
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => resolve({ url, w: img.naturalWidth, h: img.naturalHeight });
      img.src = url;
    };
    reader.readAsDataURL(file);
  });
}

export function DesignForm({ id }: { id?: number }) {
  const { designs, loading } = useDesigns();
  const existing = id ? designs.find((d) => d.id === id) : undefined;

  if (loading) return <div className="content-inner pt-7"><div className="skeleton h-64" /></div>;
  if (id && !existing) {
    return (
      <div className="content-inner pb-16 pt-7">
        <div className="empty-state px-6 py-20 text-center">
          <p className="text-base font-medium">File tidak ditemukan.</p>
          <p className="mt-1 text-[13px] text-muted">File mungkin sudah dihapus.</p>
          <Link href="/library" className="primary-button mt-5 inline-flex">Kembali ke Library</Link>
        </div>
      </div>
    );
  }
  return <FormBody key={existing?.id ?? "new"} existing={existing} />;
}

function FormBody({ existing }: { existing?: Design }) {
  const router = useRouter();
  const { designs, add, update } = useDesigns();
  const { showToast } = useToast();
  const nextNo = useMemo(() => designs.length + 1, [designs.length]);

  const [nama, setNama] = useState(existing?.nama ?? "");
  const [category, setCategory] = useState(existing?.category ?? "");
  const [subCategory, setSubCategory] = useState(existing?.subCategory ?? "");
  const [tipe, setTipe] = useState(existing?.tipe ?? "");
  const [link, setLink] = useState(existing?.link ?? "");
  const [keywords, setKeywords] = useState(existing?.keywords.join(", ") ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [sourceNo, setSourceNo] = useState(String(existing?.sourceNo ?? nextNo));
  const [image, setImage] = useState<{ url: string; w: number; h: number; name: string; file?: File } | null>(
    existing?.image ? { url: existing.image, w: existing.w, h: existing.h, name: existing.preview } : null,
  );
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const firstErrorRef = useRef<HTMLElement | null>(null);

  useEffect(() => { firstErrorRef.current?.focus(); firstErrorRef.current = null; }, [errors]);

  const categoryOptions = existing && !categoryNames.includes(existing.category as never) ? [...categoryNames, existing.category] : categoryNames;
  const subOptions = useMemo(() => {
    const known: string[] = [...(categoryGroups.find((group) => group.name === category)?.subcategories ?? [])];
    return subCategory && !known.includes(subCategory) ? [...known, subCategory] : known;
  }, [category, subCategory]);
  const mediaGroups = useMemo(() => {
    const all: string[] = [...mediaTypes];
    if (tipe && !all.includes(tipe)) all.push(tipe);
    const groups = new Map<string, string[]>();
    all.forEach((type) => {
      const letter = type[0].toUpperCase();
      groups.set(letter, [...(groups.get(letter) ?? []), type]);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [tipe]);

  const takeFile = async (file: File | undefined) => {
    if (!file) return;
    if (!(file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp")) return setErrors((e) => ({ ...e, image: "File harus PNG, JPG, atau WebP." }));
    if (file.size > MAX_BYTES) return setErrors((e) => ({ ...e, image: "Ukuran gambar maksimal 5 MB." }));
    try {
      const result = await readImage(file);
      setImage({ ...result, name: file.name, file });
      setErrors((e) => ({ ...e, image: undefined }));
    } catch {
      setErrors((e) => ({ ...e, image: "Gambar tidak bisa dibaca. Coba file lain." }));
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void takeFile(event.dataTransfer.files[0]);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const no = Number(sourceNo);
    const next: Errors = {};
    if (!nama.trim()) next.nama = "Nama file wajib diisi.";
    if (!category) next.category = "Category wajib dipilih.";
    if (!subCategory) next.subCategory = "Sub category wajib dipilih.";
    if (!tipe) next.tipe = "Media type wajib dipilih.";
    if (!Number.isInteger(no) || no < 1) next.sourceNo = "No harus bilangan bulat positif.";
    else if (designs.some((d) => d.sourceNo === no && d.id !== existing?.id)) next.sourceNo = "No ini sudah dipakai file lain.";
    if (link.trim() && !validUrl(link.trim())) next.link = "Link harus diawali http:// atau https://.";
    if (errors.image) next.image = errors.image;
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      firstErrorRef.current = document.getElementById(`field-${first}`);
      return;
    }

    const fields: DesignFields = {
      sourceNo: no,
      nama: nama.trim(),
      category,
      subCategory,
      tipe,
      link: link.trim(),
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      preview: image?.name ?? existing?.preview ?? "",
      note: note.trim(),
      w: image?.w ?? existing?.w ?? 16,
      h: image?.h ?? existing?.h ?? 9,
      image: image?.url,
    };
    setSaving(true);
    let uploaded: string | undefined;
    try {
      if (image?.file) {
        uploaded = await uploadPreview(image.file);
        fields.image = uploaded;
      }
      if (existing) await update(existing.id, fields);
      else await add(fields);
      showToast(existing ? "Perubahan disimpan." : "File ditambahkan.");
      router.push("/library");
    } catch {
      setSaving(false);
      void removePreview(uploaded);
      showToast("Gagal menyimpan. Periksa koneksi atau login admin lalu coba lagi.", "error");
    }
  };

  const err = (key: keyof Errors) => errors[key] && <p className="form-error mt-1.5" id={`err-${key}`} role="alert">{errors[key]}</p>;
  const aria = (key: keyof Errors) => ({ "aria-invalid": !!errors[key], "aria-describedby": errors[key] ? `err-${key}` : undefined });

  return (
    <main className="content-inner pb-16 pt-7">
      <p className="eyebrow">{existing ? "Edit file" : "Tambah file"}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">{existing ? "Edit design asset" : "Tambah design asset"}</h2>
      <p className="mt-1 text-[13px] text-muted">{existing ? "Ubah data file lalu simpan." : "Upload satu file design. Tanda * wajib diisi."}</p>

      <form className="form-card mt-6" onSubmit={submit} noValidate>
        <div className="form-grid">
          <div className="form-col">
            <span className="form-label" id="image-label">Gambar preview</span>
            <div
              className={`dropzone ${dragging ? "is-dragging" : ""} ${errors.image ? "has-error" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt={`Preview ${image.name}`} className="dropzone-img" />
              ) : (
                <div className="dropzone-empty"><span className="dropzone-icon"><ImageIcon /></span><strong>Tarik gambar ke sini</strong><span>PNG, JPG, atau WebP · maks 5 MB</span></div>
              )}
            </div>
            <input ref={fileRef} id="field-image" className="sr-only" type="file" accept="image/*" aria-labelledby="image-label" onChange={(e) => { void takeFile(e.target.files?.[0]); e.target.value = ""; }} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" className="control-button" onClick={() => fileRef.current?.click()}>{image ? "Ganti gambar" : "Pilih gambar"}</button>
              {image && <button type="button" className="control-button" onClick={() => setImage(null)}>Hapus gambar</button>}
            </div>
            {image && <p className="mt-2 break-all text-[11px] text-muted">{image.name} · {image.w}×{image.h}</p>}
            {err("image")}
          </div>

          <div className="form-col">
            <div className="form-field">
              <label className="form-label" htmlFor="field-nama">Nama file *</label>
              <input id="field-nama" className="form-input" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Mis. Poster Webinar Figma" {...aria("nama")} />
              {err("nama")}
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="field-category">Category *</label>
                <select id="field-category" className="form-input" value={category} onChange={(e) => { setCategory(e.target.value); setSubCategory(""); }} {...aria("category")}>
                  <option value="">Pilih category</option>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {err("category")}
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="field-subCategory">Sub category *</label>
                <select id="field-subCategory" className="form-input" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} disabled={!category} {...aria("subCategory")}>
                  <option value="">{category ? "Pilih sub category" : "Pilih category dulu"}</option>
                  {subOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {err("subCategory")}
              </div>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="field-tipe">Media type *</label>
              <select id="field-tipe" className="form-input" value={tipe} onChange={(e) => setTipe(e.target.value)} {...aria("tipe")}>
                <option value="">Pilih media type</option>
                {mediaGroups.map(([letter, types]) => <optgroup key={letter} label={letter}>{types.map((t) => <option key={t} value={t}>{t}</option>)}</optgroup>)}
              </select>
              {err("tipe")}
            </div>
            <div className="form-row form-row-wide">
              <div className="form-field">
                <label className="form-label" htmlFor="field-link">Link Figma</label>
                <input id="field-link" className="form-input" type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://www.figma.com/design/…" {...aria("link")} />
                {err("link")}
              </div>
              <div className="form-field">
                <div className="label-row">
                  <label className="form-label" htmlFor="field-sourceNo">No</label>
                  {!existing && (
                    <span className="info-tip" tabIndex={0} role="button" aria-label="Informasi nomor otomatis">
                      <InfoIcon />
                      <span className="info-tip-popup" role="tooltip">Nomor otomatis sesuai jumlah design.</span>
                    </span>
                  )}
                </div>
                <input id="field-sourceNo" className="form-input" inputMode="numeric" value={sourceNo} readOnly={!existing} onChange={(e) => setSourceNo(e.target.value)} {...aria("sourceNo")} />
                {err("sourceNo")}
              </div>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="field-keywords">Keyword</label>
              <input id="field-keywords" className="form-input" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Pisahkan dengan koma: poster, webinar" />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="field-note">Note</label>
              <textarea id="field-note" className="form-input form-textarea" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            </div>
          </div>
        </div>
        <div className="form-actions">
          <Link href="/library" className="control-button inline-flex items-center">Batal</Link>
          <button type="submit" className="primary-button" disabled={saving}>{saving ? "Menyimpan…" : existing ? "Simpan perubahan" : "Simpan file"}</button>
        </div>
      </form>
    </main>
  );
}
