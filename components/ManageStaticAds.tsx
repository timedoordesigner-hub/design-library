"use client";

import { useMemo, useState } from "react";
import type { StaticAd } from "@/lib/googleDrive";
import { adTitle, isFigmaUrl, useStaticAdSettings, type StaticAdSetting } from "@/lib/staticAds";
import { supabase } from "@/lib/supabase";
import { ConfirmDialog } from "./ConfirmDialog";
import { Pager } from "./Pager";
import { FigmaIcon, ImageIcon, PencilIcon, SearchIcon, TrashIcon } from "./Icons";

type View = "table" | "grid";
type Status = "all" | "unlinked";
// Same as the static_ad_settings block in supabase/schema.sql (needs public.is_admin(), created by the first block there).
const SETUP_SQL = `create table if not exists public.static_ad_settings (
  ad_id text primary key,
  title text check (title is null or length(title) <= 300),
  description text check (description is null or length(description) <= 2000),
  figma_url text check (figma_url is null or (figma_url ~ '^https://' and length(figma_url) <= 2000)),
  hidden boolean not null default false
);
alter table public.static_ad_settings enable row level security;
grant select on public.static_ad_settings to anon, authenticated;
grant insert, update, delete on public.static_ad_settings to authenticated;
drop policy if exists "static_ads_read" on public.static_ad_settings;
create policy "static_ads_read" on public.static_ad_settings for select to anon, authenticated using (true);
drop policy if exists "static_ads_admin_insert" on public.static_ad_settings;
create policy "static_ads_admin_insert" on public.static_ad_settings for insert to authenticated with check (public.is_admin());
drop policy if exists "static_ads_admin_update" on public.static_ad_settings;
create policy "static_ads_admin_update" on public.static_ad_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "static_ads_admin_delete" on public.static_ad_settings;
create policy "static_ads_admin_delete" on public.static_ad_settings for delete to authenticated using (public.is_admin());
notify pgrst, 'reload schema';`;

const empty = (id: string): StaticAdSetting => ({ ad_id: id, title: null, description: null, figma_url: null, hidden: false });

export default function ManageStaticAds({ ads }: { ads: StaticAd[] }) {
  const { settings, setSettings, error: loadError } = useStaticAdSettings();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [sort, setSort] = useState("name");
  const [view, setView] = useState<View>("table");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<StaticAd>();
  const [deleting, setDeleting] = useState<StaticAd>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const byId = useMemo(() => new Map(settings?.map((s) => [s.ad_id, s])), [settings]);
  // "Deleted" = setting.hidden: removed from the site and this list; the Drive file is never touched.
  const live = useMemo(() => ads.filter((ad) => !byId.get(ad.id)?.hidden), [ads, byId]);
  const counts = useMemo(() => ({
    total: live.length,
    unlinked: live.filter((ad) => !byId.get(ad.id)?.figma_url).length,
  }), [live, byId]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return live
      .filter((ad) => {
        const setting = byId.get(ad.id);
        const matchesStatus = status === "all" || !setting?.figma_url;
        return matchesStatus && (!q || `${adTitle(ad, setting)} ${ad.name} ${setting?.description ?? ""}`.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        const sa = byId.get(a.id), sb = byId.get(b.id);
        if (sort === "name-desc") return adTitle(b, sb).localeCompare(adTitle(a, sa), undefined, { numeric: true });
        if (sort === "linked") return Number(Boolean(sb?.figma_url)) - Number(Boolean(sa?.figma_url)) || adTitle(a, sa).localeCompare(adTitle(b, sb));
        return adTitle(a, sa).localeCompare(adTitle(b, sb), undefined, { numeric: true });
      });
  }, [live, byId, query, sort, status]);

  const pageRows = rows.slice((Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize))) - 1) * pageSize).slice(0, pageSize);
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  const save = async (setting: StaticAdSetting) => {
    setSaving(true);
    setError("");
    try {
      const { error: err } = await supabase().from("static_ad_settings").upsert(setting);
      if (err) throw err;
      setSettings((current) => [...(current ?? []).filter((s) => s.ad_id !== setting.ad_id), setting]);
      setEditing(undefined);
    } catch {
      setError("Could not save. Make sure you are an admin and the static_ad_settings table exists.");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="ads-loading" role="status">Loading static ads…</div>;
  const locked = Boolean(loadError); // table missing: edits cannot persist
  const editingSetting = editing ? byId.get(editing.id) : undefined;

  const editForm = editing && (
    <div className="ads-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditing(undefined); }}>
      <form className="ads-admin-edit ads-admin-modal sa-edit" role="dialog" aria-modal="true" onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const figma = String(form.get("figma") || "").trim();
        if (figma && !isFigmaUrl(figma)) { setError("Figma link must start with https://"); return; }
        void save({
          ad_id: editing.id,
          title: String(form.get("title") || "").trim() || null,
          description: String(form.get("description") || "").trim() || null,
          figma_url: figma || null,
          hidden: editingSetting?.hidden ?? false,
        });
      }}>
        <header className="sa-edit-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={editing.thumbnail} alt="" referrerPolicy="no-referrer" />
          <div>
            <strong>Edit static ad</strong>
            <p className="sa-edit-source" title={editing.name}>{editing.name}</p>
          </div>
          <button type="button" className="icon-button" aria-label="Close" onClick={() => setEditing(undefined)}>✕</button>
        </header>
        <div className="sa-edit-body">
          <label className="sa-field">
            <span>Display title</span>
            <input name="title" maxLength={300} defaultValue={adTitle(editing, editingSetting)} />
            <small>Shown on the Static Ads page. Leave empty to use the file name.</small>
          </label>
          <label className="sa-field">
            <span>Description</span>
            <textarea name="description" rows={4} maxLength={2000} defaultValue={editingSetting?.description ?? ""} placeholder="What is this design for?" />
          </label>
          <label className="sa-field">
            <span>Figma link</span>
            <input name="figma" type="url" maxLength={2000} defaultValue={editingSetting?.figma_url ?? ""} placeholder="https://www.figma.com/design/…" />
            <small>Powers the “Open in Figma” button. Must start with https://</small>
          </label>
          {error && <p className="sa-edit-error" role="alert">{error}</p>}
        </div>
        <footer className="ads-admin-form-actions sa-edit-foot">
          <button type="button" className="control-button" onClick={() => setEditing(undefined)}>Cancel</button>
          <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        </footer>
      </form>
    </div>
  );

  return (
    <section className="ads-browser" aria-label="Manage Static Ads">
      <div className="stat-row sa-manage-stats" aria-label="Static ad summary">
        <div className="stat-card stat-green"><span className="eyebrow">Total designs</span><strong>{counts.total}</strong><span className="stat-caption">synced from Drive</span></div>
        <div className="stat-card stat-blue"><span className="eyebrow">Has Figma link</span><strong>{counts.total - counts.unlinked}</strong><span className="stat-caption">CTA ready</span></div>
        <div className="stat-card stat-orange"><span className="eyebrow">Needs Figma link</span><strong>{counts.unlinked}</strong><span className="stat-caption">CTA not set yet</span></div>
      </div>

      {loadError && (
        <div className="sa-setup" role="alert">
          <div>
            <strong>One-time setup needed</strong>
            <p>The <code>static_ad_settings</code> table does not exist yet, so titles, descriptions, Figma links, and Delete cannot be saved. Copy the SQL, run it in Supabase → SQL Editor, then reload this page.</p>
          </div>
          <button type="button" className="primary-button" onClick={() => { void navigator.clipboard.writeText(SETUP_SQL).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 2000); }); }}>{copied ? "Copied" : "Copy SQL"}</button>
        </div>
      )}
      {error && !editing && <p className="ads-error" role="alert">{error}</p>}

      <div className="sa-manage-toolbar">
        <label className="ads-search sa-manage-search">
          <SearchIcon />
          <input type="search" value={query} onChange={(e) => reset(setQuery)(e.target.value)} placeholder="Search title, filename, or description…" aria-label="Search static ads" />
        </label>
        <select className="control-select" value={status} onChange={(e) => reset(setStatus)(e.target.value as Status)} aria-label="Filter static ads">
          <option value="all">All ads ({counts.total})</option>
          <option value="unlinked">Missing Figma link ({counts.unlinked})</option>
        </select>
        <select className="control-select" value={sort} onChange={(e) => reset(setSort)(e.target.value)} aria-label="Sort static ads">
          <option value="name">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="linked">Figma linked first</option>
        </select>
        <div className="sa-view-toggle" role="group" aria-label="View mode">
          <button type="button" className={`control-button ${view === "table" ? "active" : ""}`} onClick={() => setView("table")} aria-pressed={view === "table"}>Table</button>
          <button type="button" className={`control-button ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")} aria-pressed={view === "grid"}>Thumbnail</button>
        </div>
      </div>
      <p className="sa-results-count" aria-live="polite">Showing {rows.length} of {counts.total} static ads</p>

      {rows.length ? view === "table" ? (
        <div className="data-table ads-admin-table sa-admin-table" role="table" aria-label="Static ads list">
          <div className="table-head" role="row"><span role="columnheader">Design</span><span role="columnheader">Description</span><span role="columnheader">Figma</span><span role="columnheader">Actions</span></div>
          {pageRows.map((ad) => {
            const setting = byId.get(ad.id);
            return <div key={ad.id} className="table-row" role="row">
              <span className="ads-admin-video sa-admin-design">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ad.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" />
                <span><strong>{adTitle(ad, setting)}</strong><small>{ad.name}</small></span>
              </span>
              <span className="sa-admin-description">{setting?.description || <small className="sa-muted">No description</small>}</span>
              <span>{setting?.figma_url ? <a className="icon-button sa-open-figma" href={setting.figma_url} target="_blank" rel="noreferrer noopener" title="Open in Figma" aria-label={`Open ${adTitle(ad, setting)} in Figma`}><FigmaIcon /></a> : <small className="sa-muted">Not linked</small>}</span>
              <span className="ads-admin-actions">
                <button type="button" className="icon-button icon-edit" disabled={locked} title="Edit" aria-label={`Edit ${adTitle(ad, setting)}`} onClick={() => { setError(""); setEditing(ad); }}><PencilIcon /></button>
                <button type="button" className="icon-button icon-delete" title="Delete" aria-label={`Delete ${adTitle(ad, setting)}`} disabled={saving || locked} onClick={() => setDeleting(ad)}><TrashIcon /></button>
              </span>
            </div>;
          })}
        </div>
      ) : (
        <div className="sa-manage-grid">
          {pageRows.map((ad) => {
            const setting = byId.get(ad.id);
            return <article className="sa-manage-card" key={ad.id}>
              <div className="sa-manage-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ad.thumbnail} alt={adTitle(ad, setting)} loading="lazy" referrerPolicy="no-referrer" />
              </div>
              <div className="sa-manage-card-copy">
                <strong>{adTitle(ad, setting)}</strong>
                <span>{setting?.description || "No description"}</span>
                <small>{setting?.figma_url ? "Figma link added" : "Figma link needed"}</small>
              </div>
              <div className="sa-manage-card-actions">
                <button type="button" className="control-button" disabled={locked} onClick={() => { setError(""); setEditing(ad); }}><PencilIcon /> Edit</button>
                <button type="button" className="icon-button icon-delete" title="Delete" aria-label={`Delete ${adTitle(ad, setting)}`} disabled={saving || locked} onClick={() => setDeleting(ad)}><TrashIcon /></button>
                {setting?.figma_url && <a className="icon-button sa-open-figma" href={setting.figma_url} target="_blank" rel="noreferrer noopener" title="Open in Figma" aria-label="Open Figma link"><FigmaIcon /></a>}
              </div>
            </article>;
          })}
        </div>
      ) : <div className="ads-empty"><ImageIcon /><strong>No static ads found.</strong><span>Try another search or filter.</span></div>}
      <Pager page={page} pageSize={pageSize} total={rows.length} noun="static ads" onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1); }} />

      {editForm}
      {deleting && <ConfirmDialog name={adTitle(deleting, byId.get(deleting.id))} onCancel={() => setDeleting(undefined)} onConfirm={() => { const ad = deleting; setDeleting(undefined); void save({ ...(byId.get(ad.id) ?? empty(ad.id)), hidden: true }); }} />}
    </section>
  );
}
