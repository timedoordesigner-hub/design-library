"use client";

import { useEffect, useMemo, useState } from "react";
import type { StaticAd } from "@/lib/googleDrive";
import { adTitle, useStaticAdSettings } from "@/lib/staticAds";
import { FigmaIcon, SearchIcon, ZoomIcon } from "./Icons";

// Larger render for the lightbox; Drive thumbnail links accept =wN.
const large = (src: string) => src.replace(/=w\d+$/, "=w1600");

export default function StaticAdsGallery({ ads }: { ads: StaticAd[] }) {
  const { settings } = useStaticAdSettings();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const open = (id: string | null) => { setOpenId(id); setZoomed(false); };

  const items = useMemo(() => {
    const map = new Map(settings?.map((s) => [s.ad_id, s]));
    return ads
      .map((ad) => ({ ad, setting: map.get(ad.id) }))
      .filter(({ setting }) => !setting?.hidden)
      .map(({ ad, setting }) => ({
        ad,
        title: adTitle(ad, setting),
        description: setting?.description ?? "",
        figma: setting?.figma_url ?? "",
      }));
  }, [ads, settings]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const index = list.findIndex((item) => item.ad.id === openId);
  const current = index >= 0 ? list[index] : null;
  const go = (dir: number) => open(list[(index + dir + list.length) % list.length].ad.id);

  useEffect(() => {
    if (!current) return;
    const step = (dir: number) => open(list[(index + dir + list.length) % list.length].ad.id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (zoomed) setZoomed(false); else open(null); }
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [current, index, list, zoomed]);

  return (
    <>
      <div className="ads-toolbar">
        <p className="ads-count sa-count">
          {list.length} static ad{list.length === 1 ? "" : "s"}
        </p>
        <div className="ads-search-wrap">
          <label className="ads-search">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by design name…"
              aria-label="Search static ads"
            />
          </label>
        </div>
      </div>

      {list.length ? (
        <div className="sa-masonry">
          {list.map((item) => (
            <button
              key={item.ad.id}
              type="button"
              className="sa-card"
              onClick={() => open(item.ad.id)}
              aria-label={`Preview ${item.title}`}
            >
              <span
                className="sa-thumb"
                style={item.ad.width && item.ad.height ? { aspectRatio: `${item.ad.width} / ${item.ad.height}` } : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.ad.thumbnail} alt={item.title} loading="lazy" referrerPolicy="no-referrer" />
                <span className="sa-hover">Preview</span>
              </span>
              <span className="sa-meta">
                <strong>{item.title}</strong>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="ads-empty">
          <strong>{items.length ? "No static ads match." : "No static ads yet."}</strong>
          <span>{items.length ? "Try another keyword." : "Ads added to the Drive folder show up here."}</span>
        </div>
      )}

      {current && (
        <div className="ads-modal-backdrop" onClick={() => open(null)}>
          <div
            className="ads-modal sa-modal"
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`sa-stage${zoomed ? " is-zoomed" : ""}`}>
              <button type="button" className="sa-zoom" onClick={() => setZoomed(!zoomed)} aria-label={zoomed ? "Zoom out" : "Zoom in"} title={zoomed ? "Zoom out" : "Zoom in"}>
                <ZoomIcon />
              </button>
              <div className="sa-zoom-area" onClick={() => setZoomed(!zoomed)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={current.ad.id} src={large(current.ad.thumbnail)} alt={current.title} referrerPolicy="no-referrer" draggable={false} />
              </div>
              {list.length > 1 && (
                <>
                  <button type="button" className="sa-nav sa-prev" onClick={() => go(-1)} aria-label="Previous">
                    ‹
                  </button>
                  <button type="button" className="sa-nav sa-next" onClick={() => go(1)} aria-label="Next">
                    ›
                  </button>
                </>
              )}
            </div>
            <div className="ads-modal-copy">
              <button type="button" className="ads-modal-close" onClick={() => open(null)} aria-label="Close">
                ×
              </button>
              <p className="eyebrow">
                STATIC AD · {index + 1} / {list.length}
              </p>
              <h2>{current.title}</h2>
              {current.description && <p className="sa-desc">{current.description}</p>}
              {current.figma ? (
                <a className="sa-btn primary" href={current.figma} target="_blank" rel="noreferrer noopener">
                  <FigmaIcon /> Open in Figma
                </a>
              ) : (
                <p className="sa-hint">Figma link not added yet.</p>
              )}
              <p className="sa-hint">← → to browse · click image to zoom · Esc to close</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
