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
  // Similar designs may fall outside the filtered results: append so the viewer stays open.
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
      <h2 className="text-xl font-semibold tracking-[-0.02em]">All designs</h2>
      <p className="mt-1 text-[13px] text-muted">Hover over a thumbnail to see its title, keywords, and Figma link.</p>

      <div className="gallery-sticky">
        <label className="gallery-search" htmlFor="gallery-search">
          <SearchIcon />
          <input id="gallery-search" type="search" value={query.q} onChange={(e) => update({ q: e.target.value })} placeholder="Search title, keyword, category…" autoComplete="off" />
        </label>
        <p className="gallery-hint">Separate keywords with commas or spaces, e.g. roadmap, courses.</p>
        {suggestion && (
          <p className="gallery-suggest" role="status">
            Showing results for <button type="button" onClick={() => update({ q: suggestion })}>{suggestion}</button>
            . Did you mean this instead of “{query.q}”?
          </p>
        )}

        {categories.length > 0 && (
          <div className="gallery-chips" role="group" aria-label="Filter by category">
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
          <div className="skeleton h-72" aria-label="Loading data" />
        ) : results.length === 0 ? (
          <div className="empty-state px-6 py-20 text-center">
            <p className="text-base font-medium">{designs.length ? "No matching designs." : "No designs yet."}</p>
            {designs.length > 0 && <button type="button" className="control-button mt-4" onClick={() => update({ q: "", cat: [] })}>Clear search</button>}
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[11px] text-muted" aria-live="polite">{results.length} {results.length === 1 ? "design" : "designs"}</p>
              <label className="sr-only" htmlFor="gallery-sort">Sort by</label>
              <select
                id="gallery-sort"
                className="control-select"
                value={query.dir}
                onChange={(e) => update({ sort: "no", dir: e.target.value === "desc" ? "desc" : "asc" })}
              >
                <option value="asc">Oldest to newest</option>
                <option value="desc">Newest to oldest</option>
              </select>
            </div>
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
        <p className="gallery-meta">{design.category} / {design.tipe}</p>
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
