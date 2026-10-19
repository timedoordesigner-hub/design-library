"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { deleteAllDesigns, deleteDesign, getDesigns, insertDesign, removePreview, updateDesign, upsertDesigns } from "@/lib/store";
import type { Design } from "@/lib/designs";
import { planImport, type ParsedMd } from "@/lib/importMd";
import { supabaseConfigured } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

export type DesignFields = Omit<Design, "id">;

type DesignsContextValue = {
  designs: Design[];
  loading: boolean;
  error: string;
  add: (fields: DesignFields) => Promise<Design>;
  update: (id: number, fields: DesignFields) => Promise<Design>;
  remove: (id: number) => Promise<void>;
  importMany: (rows: ParsedMd[], overwrite: boolean) => Promise<{ added: number; updated: number }>;
  removeAll: () => Promise<number>;
};

const DesignsContext = createContext<DesignsContextValue | null>(null);

export function DesignsProvider({ children }: { children: ReactNode }) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [error, setError] = useState(supabaseConfigured ? "" : "Supabase belum dikonfigurasi. Isi .env.local lalu restart server.");
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!supabaseConfigured) return;
    let active = true;
    getDesigns().then((items) => {
      if (active) setDesigns(items);
    }).catch(() => {
      if (active) setError("Data library tidak dapat dimuat dari server.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const byNo = (a: Design, b: Design) => a.sourceNo - b.sourceNo;

  const add = useCallback(async (fields: DesignFields) => {
    if (!isAdmin) throw new Error("Khusus admin.");
    const design = await insertDesign(fields);
    setDesigns((current) => [...current, design].sort(byNo));
    return design;
  }, [isAdmin]);

  const update = useCallback(async (id: number, fields: DesignFields) => {
    if (!isAdmin) throw new Error("Khusus admin.");
    const old = designs.find((item) => item.id === id);
    const design = await updateDesign(id, fields);
    if (old?.image && old.image !== design.image) void removePreview(old.image);
    setDesigns((current) => current.map((item) => item.id === id ? design : item).sort(byNo));
    return design;
  }, [designs, isAdmin]);

  const remove = useCallback(async (id: number) => {
    if (!isAdmin) throw new Error("Khusus admin.");
    const old = designs.find((item) => item.id === id);
    await deleteDesign(id);
    void removePreview(old?.image);
    setDesigns((current) => current.filter((design) => design.id !== id));
  }, [designs, isAdmin]);

  const importMany = useCallback(async (rows: ParsedMd[], overwrite: boolean) => {
    if (!isAdmin) throw new Error("Khusus admin.");
    const plan = planImport(rows, designs, overwrite);
    const items = plan.filter((row) => row.design && (row.status === "new" || row.status === "update")).map((row) => row.design as Design);
    // id client diabaikan; konflik source_no -> update baris yang ada (atomik).
    const saved = await upsertDesigns(items);
    setDesigns((current) => {
      const nos = new Set(saved.map((item) => item.sourceNo));
      return [...current.filter((item) => !nos.has(item.sourceNo)), ...saved].sort(byNo);
    });
    return {
      added: plan.filter((row) => row.status === "new").length,
      updated: plan.filter((row) => row.status === "update").length,
    };
  }, [designs, isAdmin]);

  const removeAll = useCallback(async () => {
    if (!isAdmin) throw new Error("Khusus admin.");
    const count = await deleteAllDesigns();
    setDesigns([]);
    return count;
  }, [isAdmin]);

  const value = useMemo(() => ({ designs, loading, error, add, update, remove, importMany, removeAll }), [add, designs, error, importMany, loading, remove, removeAll, update]);
  return <DesignsContext.Provider value={value}>{children}</DesignsContext.Provider>;
}

export function useDesigns() {
  const context = useContext(DesignsContext);
  if (!context) throw new Error("useDesigns must be used inside DesignsProvider");
  return context;
}
