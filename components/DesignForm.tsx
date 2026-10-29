"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";
import { validUrl, type Design } from "@/lib/designs";
import { removePreview, uploadPreview } from "@/lib/store";
import { categoryNames, mediaTypes } from "@/lib/taxonomy";
import { useDesigns, type DesignFields } from "./DesignsProvider";
import { ImageIcon, InfoIcon } from "./Icons";
import { useToast } from "./Toast";

const MAX_BYTES = 5 * 1024 * 1024;

type Errors = Partial<Record<"nama" | "category" | "tipe" | "link" | "sourceNo" | "image", string>>;

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
          <p className="text-base font-medium">File not found.</p>
          <p className="mt-1 text-[13px] text-muted">This file may have been deleted.</p>
          <Link href="/library" className="primary-button mt-5 inline-flex">Back to library</Link>
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
    if (!(file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp")) return setErrors((e) => ({ ...e, image: "File must be PNG, JPG, or WebP." }));
    if (file.size > MAX_BYTES) return setErrors((e) => ({ ...e, image: "Image size must be 5 MB or less." }));
    try {
      const result = await readImage(file);
      setImage({ ...result, name: file.name, file });
      setErrors((e) => ({ ...e, image: undefined }));
    } catch {
      setErrors((e) => ({ ...e, image: "Image could not be read. Try another file." }));
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
    if (!nama.trim()) next.nama = "File name is required.";
    if (!category) next.category = "Category is required.";
    if (!tipe) next.tipe = "Media type is required.";
    if (!Number.isInteger(no) || no < 1) next.sourceNo = "No. must be a positive whole number.";
    else if (designs.some((d) => d.sourceNo === no && d.id !== existing?.id)) next.sourceNo = "This No. is already used by another file.";
    if (link.trim() && !validUrl(link.trim())) next.link = "Link must start with http:// or https://.";
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
      subCategory: existing?.subCategory ?? "-", // ponytail: DB column still exists; UI no longer uses it
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
      showToast(existing ? "Changes saved." : "File added.");
      router.push("/library");
    } catch {
      setSaving(false);
      void removePreview(uploaded);
      showToast("Could not save. Check your connection or admin login, then try again.", "error");
    }
  };

  const err = (key: keyof Errors) => errors[key] && <p className="form-error mt-1.5" id={`err-${key}`} role="alert">{errors[key]}</p>;
  const aria = (key: keyof Errors) => ({ "aria-invalid": !!errors[key], "aria-describedby": errors[key] ? `err-${key}` : undefined });

  return (
    <main className="content-inner pb-16 pt-7">
      <p className="eyebrow">{existing ? "Edit file" : "Add file"}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">{existing ? "Edit design asset" : "Add design asset"}</h2>
      <p className="mt-1 text-[13px] text-muted">{existing ? "Update the file details, then save." : "Upload one design file. Fields marked * are required."}</p>

      <form className="form-card mt-6" onSubmit={submit} noValidate>
        <div className="form-grid">
          <div className="form-col">
            <span className="form-label" id="image-label">Preview image</span>
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
                <div className="dropzone-empty"><span className="dropzone-icon"><ImageIcon /></span><strong>Drop an image here</strong><span>PNG, JPG, or WebP · max 5 MB</span></div>
              )}
            </div>
            <input ref={fileRef} id="field-image" className="sr-only" type="file" accept="image/*" aria-labelledby="image-label" onChange={(e) => { void takeFile(e.target.files?.[0]); e.target.value = ""; }} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" className="control-button" onClick={() => fileRef.current?.click()}>{image ? "Replace image" : "Choose image"}</button>
              {image && <button type="button" className="control-button" onClick={() => setImage(null)}>Remove image</button>}
            </div>
            {image && <p className="mt-2 break-all text-[11px] text-muted">{image.name} · {image.w}×{image.h}</p>}
            {err("image")}
          </div>

          <div className="form-col">
            <div className="form-field">
              <label className="form-label" htmlFor="field-nama">File name *</label>
              <input id="field-nama" className="form-input" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="E.g. Figma webinar poster" {...aria("nama")} />
              {err("nama")}
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="field-category">Category *</label>
                <select id="field-category" className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} {...aria("category")}>
                  <option value="">Select category</option>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {err("category")}
              </div>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="field-tipe">Media type *</label>
              <select id="field-tipe" className="form-input" value={tipe} onChange={(e) => setTipe(e.target.value)} {...aria("tipe")}>
                <option value="">Select media type</option>
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
                    <span className="info-tip" tabIndex={0} role="button" aria-label="About automatic numbering">
                      <InfoIcon />
                      <span className="info-tip-popup" role="tooltip">Numbered automatically based on the number of designs.</span>
                    </span>
                  )}
                </div>
                <input id="field-sourceNo" className="form-input" inputMode="numeric" value={sourceNo} readOnly={!existing} onChange={(e) => setSourceNo(e.target.value)} {...aria("sourceNo")} />
                {err("sourceNo")}
              </div>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="field-keywords">Keyword</label>
              <input id="field-keywords" className="form-input" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Separate with commas: poster, webinar" />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="field-note">Note</label>
              <textarea id="field-note" className="form-input form-textarea" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            </div>
          </div>
        </div>
        <div className="form-actions">
          <Link href="/library" className="control-button inline-flex items-center">Cancel</Link>
          <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving…" : existing ? "Save changes" : "Save file"}</button>
        </div>
      </form>
    </main>
  );
}
