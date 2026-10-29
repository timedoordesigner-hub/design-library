"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { toneOf } from "@/lib/taxonomy";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { deriveOptions, type Design } from "@/lib/designs";
import { useDesigns } from "./DesignsProvider";
import { ConfirmDialog } from "./ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "./Icons";
import { useToast } from "./Toast";
import { apply, parseQuery, toParams, type Query, type SortKey } from "@/lib/query";
import { Thumb } from "./Thumb";
import { Viewer } from "./Viewer";
import { useAuth } from "./AuthProvider";

type OpenHandler = (design: Design, element: HTMLElement) => void;
type DeleteHandler = (design: Design) => void;

export function Library() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { designs, loading, error, remove } = useDesigns();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const query = useMemo(() => parseQuery(new URLSearchParams(searchParams.toString())), [searchParams]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Design | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const { categories, tipes } = useMemo(() => deriveOptions(designs), [designs]);

  const results = useMemo(() => apply(designs, query), [designs, query]);
  const activeDesign = query.id ? designs.find((design) => design.id === query.id) : null;
  const viewerDesigns = activeDesign && !results.some((design) => design.id === activeDesign.id) ? [...results, activeDesign] : results;
  const filterCount = query.cat.length + query.tipe.length;
  const hasFilters = filterCount > 0;

  const update = useCallback((changes: Partial<Query>) => {
    const next = { ...query, ...changes };
    const qs = toParams(next).toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, query, router]);

  const openDesign: OpenHandler = (design, element) => {
    lastFocusRef.current = element;
    update({ id: design.id });
  };
  const closeViewer = useCallback(() => {
    update({ id: null });
    window.setTimeout(() => lastFocusRef.current?.focus(), 0);
  }, [update]);
  const navigateViewer = useCallback((id: number) => update({ id }), [update]);

  const confirmDelete = async () => {
    const target = pendingDelete;
    if (!target) return;
    setPendingDelete(null);
    try {
      await remove(target.id);
      if (query.id === target.id) update({ id: null });
      showToast(`“${target.nama}” dihapus.`);
    } catch {
      showToast("Gagal menghapus file.", "error");
    }
  };

  const toggleValue = (key: "cat" | "tipe", value: string) => {
    const values = query[key].includes(value) ? query[key].filter((v) => v !== value) : [...query[key], value];
    update({ [key]: values });
  };

  return (
    <main className="library-shell">
      <div className="content-inner pb-16 pt-7">
        <section className="page-intro flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">All files</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">Design assets</h2>
            <p className="mt-1 text-[13px] text-muted">Temukan, lihat, dan kelola file design Timedor Academy.</p>
          </div>
          {isAdmin && <Link href="/tambah" className="primary-button"><PlusIcon />Tambah file</Link>}
        </section>
        {error && <p className="notice notice-warning mt-4" role="alert">{error} Data baru tidak akan tersimpan.</p>}
        <section className="stat-row mt-6" aria-label="Ringkasan library">
          <div className="stat-card stat-green"><span className="eyebrow">Total file</span><strong>{designs.length}</strong><span className="stat-caption">file terdaftar</span></div>
          <div className="stat-card stat-blue"><span className="eyebrow">Category</span><strong>{categories.length}</strong><span className="stat-caption">kategori terdaftar</span></div>
          <div className="stat-card stat-orange"><span className="eyebrow">Media type</span><strong>{tipes.length}</strong><span className="stat-caption">jenis media</span></div>
        </section>
        <div className="toolbar mt-7 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button className={`control-button ${filterOpen || hasFilters ? "active" : ""}`} onClick={() => setFilterOpen(!filterOpen)} aria-expanded={filterOpen}>
              Filter{hasFilters ? ` (${filterCount})` : ""}
            </button>
            <p className="text-[13px] text-muted" aria-live="polite">{results.length} dari {designs.length} file</p>
          </div>
          <div className="toolbar-actions flex items-center gap-2">
            <label className="sr-only" htmlFor="sort">Urutkan</label>
            <select id="sort" className="control-select" value={query.sort} onChange={(e) => update({ sort: e.target.value as SortKey })}>
              <option value="no">Urut: Old / New </option>
              <option value="nama">Urut: Nama</option>
              <option value="category">Urut: Category</option>
              <option value="tipe">Urut: Media type</option>
            </select>
            <button className="control-button" onClick={() => update({ dir: query.dir === "asc" ? "desc" : "asc" })} aria-label={query.dir === "asc" ? "Urutan naik, klik untuk turun" : "Urutan turun, klik untuk naik"}>{query.sort === "no" ? (query.dir === "asc" ? "Lama→Baru" : "Baru→Lama") : query.dir === "asc" ? "A→Z" : "Z→A"}</button>
            <div className="flex items-center gap-2" role="group" aria-label="Tampilan">
              <button className={`control-button view-button ${query.view === "list" ? "active" : ""}`} onClick={() => update({ view: "list" })} aria-pressed={query.view === "list"}>Tabel</button>
              <button className={`control-button view-button ${query.view === "grid" ? "active" : ""}`} onClick={() => update({ view: "grid" })} aria-pressed={query.view === "grid"}>Thumbnail</button>
            </div>
          </div>
        </div>

        {filterOpen && (
          <div className="filter-panel mt-3 grid gap-6 p-5">
            <FilterGroup label="Category" values={categories} selected={query.cat} onToggle={(v) => toggleValue("cat", v)} tone />
            <FilterGroup label="Media type" values={tipes} selected={query.tipe} onToggle={(v) => toggleValue("tipe", v)} />
            {hasFilters && <button className="control-button w-fit" onClick={() => update({ cat: [], tipe: [] })}>Hapus filter</button>}
          </div>
        )}

        <div className="mt-4">
          {loading ? (
            <div className="skeleton h-72" aria-label="Memuat data" />
          ) : designs.length === 0 ? (
            <div className="empty-state px-6 py-20 text-center">
              <p className="text-base font-medium">Library masih kosong.</p>
              <p className="mt-1 text-[13px] text-muted">{isAdmin ? "Mulai dengan menambahkan file design pertama." : "Belum ada file design yang ditambahkan."}</p>
              {isAdmin && <Link href="/tambah" className="primary-button mt-5 inline-flex"><PlusIcon />Tambah file pertama</Link>}
            </div>
          ) : results.length === 0 ? (
            <div className="empty-state px-6 py-20 text-center">
              <p className="text-base font-medium">{query.q ? `Tidak ada hasil untuk “${query.q}”.` : "Tidak ada file yang cocok."}</p>
              <p className="mt-1 text-[13px] text-muted">Coba kata lain atau hapus filter.</p>
            </div>
          ) : query.view === "grid" ? (
            <CardGrid items={results} onOpen={openDesign} onDelete={isAdmin ? setPendingDelete : undefined} />
          ) : (
            <Table items={results} onOpen={openDesign} onDelete={isAdmin ? setPendingDelete : undefined} />
          )}
        </div>
      </div>
      {activeDesign && <Viewer designs={viewerDesigns} activeId={activeDesign.id} onClose={closeViewer} onNavigate={navigateViewer} onDelete={isAdmin ? setPendingDelete : undefined} />}
      {isAdmin && pendingDelete && <ConfirmDialog name={pendingDelete.nama} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />}
    </main>
  );
}

function CategoryChip({ category }: { category: string }) {
  const tone = toneOf(category);
  return <span className="category-chip" style={{ "--chip-bg": tone.soft, "--chip-fg": tone.accent } as CSSProperties}>{category}</span>;
}

function FilterGroup({ label, values, selected, onToggle, tone }: { label: string; values: string[]; selected: string[]; onToggle: (value: string) => void; tone?: boolean }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3">{label}</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {values.map((value) => (
          <label key={value} className="filter-check">
            <input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} />
            {tone && <span className="tone-dot" style={{ background: toneOf(value).accent }} aria-hidden="true" />}
            {value}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function activateOnKey(event: KeyboardEvent<HTMLElement>, run: () => void) {
  if (event.target !== event.currentTarget) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    run();
  }
}

export function RowActions({ design, onDelete }: { design: Design; onDelete: DeleteHandler }) {
  return (
    <span className="row-actions" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <Link href={`/edit/${design.id}`} className="icon-button icon-edit" aria-label={`Edit ${design.nama}`} title="Edit"><PencilIcon /></Link>
      <button type="button" className="icon-button icon-delete" aria-label={`Hapus ${design.nama}`} title="Hapus" onClick={() => onDelete(design)}><TrashIcon /></button>
    </span>
  );
}

function Table({ items, onOpen, onDelete }: { items: Design[]; onOpen: OpenHandler; onDelete?: DeleteHandler }) {
  return (
    <div className={`data-table ${onDelete ? "" : "table-viewer"}`} role="table" aria-label="Daftar file design">
      <div className="table-head" role="row">
        <span role="columnheader">No</span>
        <span role="columnheader">Nama file</span>
        <span role="columnheader">Category</span>
        <span role="columnheader">Media type</span>
        <span role="columnheader">Keyword</span>
        <span role="columnheader">Note</span>
        <span role="columnheader">Preview</span>
        <span role="columnheader">Link</span>
        {onDelete && <span role="columnheader">Aksi</span>}
      </div>
      {items.map((design) => (
        <div
          key={design.id}
          className="table-row cursor-pointer"
          role="row"
          tabIndex={0}
          onClick={(e: MouseEvent<HTMLElement>) => onOpen(design, e.currentTarget)}
          onKeyDown={(e) => activateOnKey(e, () => onOpen(design, e.currentTarget))}
        >
          <span className="table-no" role="cell">{design.sourceNo}</span>
          <span className="min-w-0" role="cell">
            <span className="file-name block">{design.nama}</span>
            <span className="file-subtext mt-0.5 block">{design.tipe}</span>
          </span>
          <span className="min-w-0" role="cell"><CategoryChip category={design.category} /></span>
          <span role="cell" className="min-w-0"><span className="type-label">{design.tipe}</span></span>
          <span role="cell"><span className="tag-list">{design.keywords.slice(0, 3).map((k) => <span key={k} className="tag">{k}</span>)}</span></span>
          <span className="table-cell-muted" role="cell">{design.note || "—"}</span>
          <span className="preview-cell" role="cell"><Thumb design={design} compact /></span>
          <span role="cell">{design.link ? <a className="figma-link" href={design.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Figma ↗</a> : <span className="table-cell-muted">—</span>}</span>
          {onDelete && <span role="cell"><RowActions design={design} onDelete={onDelete} /></span>}
        </div>
      ))}
    </div>
  );
}

function CardGrid({ items, onOpen, onDelete }: { items: Design[]; onOpen: OpenHandler; onDelete?: DeleteHandler }) {
  return (
    <div className="card-grid">
      {items.map((design) => (
        <div key={design.id} className="file-card">
          <button type="button" className="file-card-open" onClick={(e) => onOpen(design, e.currentTarget)}>
            <Thumb design={design} />
            <span className="file-card-body block">
              <span className="mono text-[10px] text-muted-soft">{design.sourceNo}</span>
              <strong className="mt-1 block text-[13px] font-medium leading-snug">{design.nama}</strong>
              <span className="mt-2 flex flex-wrap items-center gap-1.5"><CategoryChip category={design.category} /><span className="type-label">{design.tipe}</span></span>
            </span>
          </button>
          {onDelete && <div className="file-card-actions"><RowActions design={design} onDelete={onDelete} /></div>}
        </div>
      ))}
    </div>
  );
}
