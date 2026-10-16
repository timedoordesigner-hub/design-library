import type { Design } from "./designs";
import { BUCKET, supabase } from "./supabase";

export type DesignFields = Omit<Design, "id">;

type Row = {
  id: number;
  source_no: number;
  nama: string;
  category: string;
  sub_category: string;
  tipe: string;
  link: string;
  keywords: string[];
  preview: string;
  note: string;
  w: number;
  h: number;
  image: string | null;
};

const fromRow = (r: Row): Design => ({
  id: r.id,
  sourceNo: r.source_no,
  nama: r.nama,
  category: r.category,
  subCategory: r.sub_category,
  tipe: r.tipe,
  link: r.link,
  keywords: r.keywords,
  preview: r.preview,
  note: r.note,
  w: r.w,
  h: r.h,
  image: r.image ?? undefined,
});

const toRow = (f: DesignFields): Omit<Row, "id"> => ({
  source_no: f.sourceNo,
  nama: f.nama,
  category: f.category,
  sub_category: f.subCategory,
  tipe: f.tipe,
  link: f.link,
  keywords: f.keywords,
  preview: f.preview,
  note: f.note,
  w: f.w,
  h: f.h,
  image: f.image ?? null,
});

const byNo = (a: Design, b: Design) => a.sourceNo - b.sourceNo;

export async function getDesigns(): Promise<Design[]> {
  const { data, error } = await supabase().from("designs").select("*").order("source_no").limit(5000);
  if (error) throw error;
  return (data as Row[]).map(fromRow).sort(byNo);
}

export async function insertDesign(fields: DesignFields): Promise<Design> {
  const { data, error } = await supabase().from("designs").insert(toRow(fields)).select().single();
  if (error) throw error;
  return fromRow(data as Row);
}

export async function updateDesign(id: number, fields: DesignFields): Promise<Design> {
  const { data, error } = await supabase().from("designs").update(toRow(fields)).eq("id", id).select().single();
  if (error) throw error;
  return fromRow(data as Row);
}

// Satu statement = atomik. Konflik pada source_no -> update baris yang ada.
export async function upsertDesigns(items: DesignFields[]): Promise<Design[]> {
  if (!items.length) return [];
  const { data, error } = await supabase().from("designs").upsert(items.map(toRow), { onConflict: "source_no" }).select();
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

export async function deleteDesign(id: number): Promise<void> {
  const { error } = await supabase().from("designs").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadPreview(file: File): Promise<string> {
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase().storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw error;
  return supabase().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Best effort: baris DB sudah benar walau objek yatim tersisa.
export async function removePreview(url: string | undefined): Promise<void> {
  const marker = `/${BUCKET}/`;
  const at = url?.indexOf(marker) ?? -1;
  if (!url || at < 0) return;
  await supabase().storage.from(BUCKET).remove([decodeURIComponent(url.slice(at + marker.length).split("?")[0])]).catch(() => undefined);
}
