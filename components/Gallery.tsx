"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { deriveOptions, type Design } from "@/lib/designs";
import { apply, correction, parseQuery, toParams, type Query } from "@/lib/query";
import { toneOf } from "@/lib/taxonomy";
import { useDesigns } from "./DesignsProvider";
import { Thumb } from "./Thumb";
import { Viewer } from "./Viewer";
import { SearchIcon } from "./Icons";

export function Gallery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { designs, loading, error } = useDesigns();
  const query = useMemo(() => parseQuery(new URLSearchParams(searchParams.toString())), [searchParams]);
  const { categories } = useMemo(() => deriveOptions(designs), [designs]);
  const results = useMemo(() => apply(designs, query), [designs, query]);
  const suggestion = useMemo(() => correction(designs, query.q), [designs, query.q]);
  // Design serupa bisa di luar hasil filter: tambahkan agar viewer tetap terbuka.
  const activeDesign = query.id ? designs.find((d) => d.id === query.id) : undefined;
  const viewerDesigns = activeDesign && !results.some((d) => d.id === activeDesign.id) ? [...results, activeDesign] : results;

  const update = useCallback((patch: Partial<Query>) => {
    const qs = toParams({ ...query, ...patch }).toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, query, router]);

  const toggleCategory = (category: string) =>
    update({ cat: query.cat.includes(category) ? query.cat.filter((c) => c !== category) : [...query.cat, category] });

  return (
    <main className="content-inner pb-16 pt-7">
      <h2 className="text-xl font-semibold tracking-[-0.02em]">Semua design</h2>
      <p className="mt-1 text-[13px] text-muted">Arahkan kursor ke thumbnail untuk melihat judul, keyword, dan link Figma.</p>

      <div className="gallery-sticky">
        <label className="gallery-search" htmlFor="gallery-search">
          <SearchIcon />
          <input id="gallery-search" type="search" value={query.q} onChange={(e) => update({ q: e.target.value })} placeholder="Cari judul, keyword, category…" autoComplete="off" />
        </label>
        <p className="gallery-hint">Pisahkan keyword dengan koma atau spasi, contoh: roadmap, courses.</p>
        {suggestion && (
          <p className="gallery-suggest" role="status">
            Menampilkan hasil untuk <button type="button" onClick={() => update({ q: suggestion })}>{suggestion}</button>
            . Mungkin maksud kamu itu, bukan “{query.q}”.
          </p>
        )}

        {categories.length > 0 && (
          <div className="gallery-chips" role="group" aria-label="Filter category">
            {categories.map((category) => (
              <button key={category} type="button" className={`control-button ${query.cat.includes(category) ? "active" : ""}`} aria-pressed={query.cat.includes(category)} onClick={() => toggleCategory(category)}>
                <span className="tone-dot" style={{ background: toneOf(category).accent }} aria-hidden="true" />
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="notice notice-warning mt-4" role="alert">{error}</p>}

      <div className="mt-5">
        {loading ? (
          <div className="skeleton h-72" aria-label="Memuat data" />
        ) : results.length === 0 ? (
          <div className="empty-state px-6 py-20 text-center">
            <p className="text-base font-medium">{designs.length ? "Tidak ada design yang cocok." : "Belum ada design."}</p>
            {designs.length > 0 && <button type="button" className="control-button mt-4" onClick={() => update({ q: "", cat: [] })}>Hapus pencarian</button>}
          </div>
        ) : (
          <>
            <p className="mb-3 text-[11px] text-muted" aria-live="polite">{results.length} design</p>
            <ul className="gallery-grid">
              {results.map((design) => <li key={design.id}><GalleryCard design={design} onOpen={() => update({ id: design.id })} /></li>)}
            </ul>
          </>
        )}
      </div>

      {activeDesign && (
        <Viewer designs={viewerDesigns} activeId={activeDesign.id} onClose={() => update({ id: null })} onNavigate={(id) => update({ id })} />
      )}
    </main>
  );
}

function GalleryCard({ design, onOpen }: { design: Design; onOpen: () => void }) {
  return (
    <article className="gallery-card">
      <div className="gallery-media"><Thumb design={design} /></div>
      <div className="gallery-foot">
        <strong>{design.nama}</strong>
        <span>{design.category} · {design.tipe}</span>
      </div>
      <div className="gallery-info">
        <h3>{design.nama}</h3>
        <p className="gallery-meta">{design.category} / {design.subCategory} / {design.tipe}</p>
        {design.keywords.length > 0 && (
          <ul className="tag-list" aria-label="Keyword">
            {design.keywords.slice(0, 8).map((keyword) => <li key={keyword} className="tag">{keyword}</li>)}
          </ul>
        )}
        {design.note && <p className="gallery-note">{design.note}</p>}
        <div className="gallery-actions">
          {design.link && <a href={design.link} target="_blank" rel="noreferrer" className="primary-button">Figma <span aria-hidden="true">↗</span></a>}
          <button type="button" className="control-button" onClick={onOpen}>Detail</button>
        </div>
      </div>
    </article>
  );
}
