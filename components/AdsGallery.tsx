"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import type { AdVideo } from "@/lib/googleDrive";
import { EyeIcon, EyeOffIcon, InfoIcon, PencilIcon, SearchIcon, VideoIcon } from "./Icons";

type Props = { videos: AdVideo[]; manage?: boolean };
type VideoSetting = { video_id: string; title: string | null; description: string | null; hidden: boolean };

const formatDuration = (seconds: number) =>
  seconds
    ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
    : "";

// Videos uploaded within this many days count as "New" in Manage Ads.
const NEW_DAYS = 7;
const RECENT_LIMIT = 8;

const uploadAge = (iso: string, now: number) => {
  const minutes = Math.max(0, Math.floor((now - Date.parse(iso)) / 60_000));
  if (minutes < 60) return "just now";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}d ago` : new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const InfoTip = ({ label, children, right = false }: { label: string; children: string; right?: boolean }) => (
  <span className={`info-tip${right ? " info-tip-right" : ""}`} tabIndex={0} role="button" aria-label={label}>
    <InfoIcon />
    <span className="info-tip-popup" role="tooltip">{children}</span>
  </span>
);

const VISIBLE_BRANCHES = 8;
const PAGE_SIZE = 24;

const branchLabel = (name: string) => name.replace(/^\d+[\s._-]*/, "");
const fileLabel = (name: string) => name.replace(/\.[^.]+$/, "");
const folderLabel = (name: string) => branchLabel(name).replace(/^\[[^\]]+\]\s*/, "");
// Judul custom menang; selain itu nama file membedakan video dalam satu folder.
const videoTitle = (video: { name: string; displayTitle?: string | null }) => video.displayTitle || fileLabel(video.name);

export default function AdsGallery({ videos: driveVideos, manage = false }: Props) {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<VideoSetting[] | null>(null);
  const [settingsError, setSettingsError] = useState("");
  const [editing, setEditing] = useState<AdVideo>();
  const [saving, setSaving] = useState(false);
  const [now] = useState(() => Date.now());
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => supabase().from("ads_video_settings").select("video_id,title,description,hidden")).then(({ data, error }) => {
      if (!active) return;
      if (error) setSettingsError("Video settings are unavailable. Contact an admin.");
      else setSettings(data as VideoSetting[]);
    }).catch(() => {
      if (active) setSettingsError("Video settings are unavailable. Contact an admin.");
    });
    return () => { active = false; };
  }, []);
  const videos = useMemo(() => driveVideos.map((video) => {
    const setting = settings?.find((item) => item.video_id === video.id);
    return { ...video, displayTitle: setting?.title, description: setting?.description ?? video.description, hidden: setting?.hidden ?? false, edited: Boolean(setting?.title || setting?.description) };
  }), [driveVideos, settings]);
  const displayedVideos = useMemo(() => videos.filter((video) => !video.hidden), [videos]);
  const [tab, setTab] = useState<AdVideo["category"]>("general");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<AdVideo["area"]>("local");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [activeVideo, setActiveVideo] = useState<(AdVideo & { displayTitle?: string | null })>();
  const [page, setPage] = useState(1);
  const branchVideos = useMemo(
    () =>
      displayedVideos.filter(
        (video) => video.category === "branch" && video.area === area,
      ),
    [area, displayedVideos],
  );
  const branches = useMemo(
    () =>
      [
        ...new Set(branchVideos.map((video) => video.branch).filter(Boolean)),
      ].sort((a, b) => branchLabel(a).localeCompare(branchLabel(b))),
    [branchVideos],
  );
  const [showAllBranches, setShowAllBranches] = useState(false);
  const shownBranches = showAllBranches
    ? branches
    : branches.slice(0, VISIBLE_BRANCHES);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [showAllFolders, setShowAllFolders] = useState(false);
  const scoped = useMemo(
    () =>
      displayedVideos.filter((video) => {
        if (video.category !== tab) return false;
        if (tab === "branch" && video.area !== area) return false;
        return !(tab === "branch" && selectedBranches.length > 0 && !selectedBranches.includes(video.branch));
      }),
    [area, selectedBranches, tab, displayedVideos],
  );
  const folderOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const video of scoped) {
      const label = folderLabel(video.group);
      if (!label) continue;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts];
  }, [scoped]);
  // Folder terpilih yang tidak ada di cakupan baru diabaikan.
  const activeFolders = selectedFolders.filter((name) => folderOptions.some(([label]) => label === name));
  const shownFolders = showAllFolders ? folderOptions : folderOptions.slice(0, VISIBLE_BRANCHES);
  const toggleFolder = (value: string) => {
    setPage(1);
    setSelectedFolders((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return scoped.filter(
      (video) =>
        (activeFolders.length === 0 || activeFolders.includes(folderLabel(video.group))) &&
        (!needle ||
          `${video.name} ${video.folder} ${video.branch} ${video.description} ${video.displayTitle ?? ""}`
            .toLowerCase()
            .includes(needle)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolders, query, scoped]);
  const pagedVideos = visible.slice(0, page * PAGE_SIZE);
  const hasMore = pagedVideos.length < visible.length;

  const chooseArea = (value: AdVideo["area"]) => {
    setArea(value);
    setSelectedBranches([]);
    setPage(1);
  };

  const toggleBranch = (value: string) => {
    setPage(1);
    setSelectedBranches((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const saveSetting = async (setting: VideoSetting) => {
    setSaving(true);
    setSettingsError("");
    try {
      const { error } = await supabase().from("ads_video_settings").upsert(setting);
      if (error) throw error;
      setSettings((current) => [...(current ?? []).filter((item) => item.video_id !== setting.video_id), setting]);
      setEditing(undefined);
    } catch {
      setSettingsError("Could not save. Make sure you are an admin and the settings table exists.");
    } finally {
      setSaving(false);
    }
  };

  if (settingsError && !settings) return <div className="ads-error" role="alert">{settingsError}</div>;
  if (!settings) return <div className="ads-loading" role="status">Loading video settings…</div>;

  if (manage && !isAdmin) return <div className="ads-error">This page is for admins only.</div>;

  const manageNeedle = query.trim().toLowerCase();
  const manageList = videos.filter((video) => `${video.name} ${video.folder} ${video.branch} ${video.displayTitle ?? ""}`.toLowerCase().includes(manageNeedle));

  const isNew = (video: AdVideo) => Boolean(video.createdTime) && now - Date.parse(video.createdTime) < NEW_DAYS * 86_400_000;
  const placeOf = (video: AdVideo) => video.category === "branch" ? `${branchLabel(video.branch)} › ${branchLabel(video.folder)}` : branchLabel(video.folder);
  const recent = manage
    ? videos.filter((video) => video.createdTime).sort((a, b) => Date.parse(b.createdTime) - Date.parse(a.createdTime)).slice(0, RECENT_LIMIT)
    : [];

  if (manage) return (
    <section className="ads-browser" aria-label="Manage Ads">
      <label className="ads-search"><SearchIcon /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search videos…" aria-label="Search videos" /></label>
      <section className="stat-row ads-admin-stats" aria-label="Video counts">
        <div className="stat-card stat-green"><span className="eyebrow">{manageNeedle ? "Results" : "Total videos"}</span><strong>{manageList.length}{manageNeedle && <small> / {videos.length}</small>}</strong><span className="stat-caption">videos in Drive sync</span></div>
        <div className="stat-card stat-blue"><span className="eyebrow">Visible <InfoTip label="What is Visible?">Videos shown to everyone on the Video Ads page.</InfoTip></span><strong>{manageList.filter((video) => !video.hidden).length}</strong><span className="stat-caption">available on the website</span></div>
        <div className="stat-card stat-orange"><span className="eyebrow">Hidden <InfoTip label="What is Hidden?">Hidden videos are removed from the website only. The Drive file is untouched.</InfoTip></span><strong>{manageList.filter((video) => video.hidden).length}</strong><span className="stat-caption">Drive files kept intact</span></div>
        <div className="stat-card stat-blue"><span className="eyebrow">Edited <InfoTip label="What is Edited?">Videos with a custom title or description that replaces the Drive one.</InfoTip></span><strong>{manageList.filter((video) => video.edited).length}</strong><span className="stat-caption">custom title or description</span></div>
      </section>
      {recent.length > 0 && <div className="ads-recent">
        <h3>Recent uploads <InfoTip label="About recent uploads">{`Newest videos synced from Google Drive. Marked "New" for ${NEW_DAYS} days after upload. Age is based on the Drive upload date.`}</InfoTip></h3>
        <ul>
          {recent.map((video) => <li key={video.id}>
            <span className="ads-recent-copy"><strong>{videoTitle(video)}</strong><small>{placeOf(video)}</small></span>
            {isNew(video) && <em className="ads-new-badge">New</em>}
            <time dateTime={video.createdTime} title={new Date(video.createdTime).toLocaleString("en-GB")}>{uploadAge(video.createdTime, now)}</time>
          </li>)}
        </ul>
      </div>}
      {settingsError && <p className="ads-error" role="alert">{settingsError}</p>}
      <div className="ads-admin-table-wrap">
        <p className="ads-admin-note">Manage the videos matching your search. Hiding a video does not delete the Drive file.</p>
        <div className="data-table ads-admin-table" role="table" aria-label="Video ads list">
          <div className="table-head" role="row">
            <span role="columnheader">Video</span>
            <span role="columnheader">Location</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Actions</span>
          </div>
          {manageList.map((video) => <div className={`table-row ads-admin-table-row${video.edited ? " is-edited" : ""}`} role="row" key={video.id}>
            <span className="ads-admin-video" role="cell"><strong>{videoTitle(video)}</strong><small>{isNew(video) && <em className="ads-new-badge">New</em>}{video.edited && <em className="ads-admin-edited" title="Title/description edited"><PencilIcon /> Edited</em>}{branchLabel(video.folder)}</small></span>
            <span className="table-cell-muted" role="cell">{video.category === "branch" ? branchLabel(video.branch) : "General"}</span>
            <span role="cell"><span className={`ads-admin-status ${video.hidden ? "is-hidden" : "is-visible"}`}>{video.hidden ? "Hidden" : "Visible"}</span></span>
            <span className="ads-admin-actions" role="cell">
              <button type="button" className="icon-button icon-edit" title="Edit" aria-label="Edit" onClick={() => setEditing(video)}><PencilIcon /></button>
              <button type="button" className={`icon-button ${video.hidden ? "icon-show" : "icon-delete"}`} title={video.hidden ? "Show" : "Hide"} aria-label={video.hidden ? "Show" : "Hide"} disabled={saving} onClick={() => {
                if (!video.hidden && !window.confirm("Hide this video from the website? The Drive file stays untouched.")) return;
                void saveSetting({ video_id: video.id, title: video.displayTitle ?? null, description: settings.find((item) => item.video_id === video.id)?.description ?? null, hidden: !video.hidden });
              }}>{video.hidden ? <EyeIcon /> : <EyeOffIcon />}</button>
            </span>
          </div>)}
        </div>
      </div>
      {editing && <div className="ads-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(undefined); }}><form className="ads-admin-edit ads-admin-modal" role="dialog" aria-modal="true" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        void saveSetting({ video_id: editing.id, title: String(form.get("title") || "").trim() || null, description: String(form.get("description") || "").trim() || null, hidden: settings.find((item) => item.video_id === editing.id)?.hidden ?? false });
      }}>
        <strong>Edit: {editing.name}</strong>
        <label>Title <input name="title" maxLength={300} defaultValue={settings.find((item) => item.video_id === editing.id)?.title ?? ""} placeholder={fileLabel(editing.name)} /></label>
        <label>Description <textarea name="description" maxLength={2000} defaultValue={settings.find((item) => item.video_id === editing.id)?.description ?? ""} placeholder="Use the Drive description" /></label>
        <div className="ads-admin-form-actions">
          <button type="button" className="control-button" onClick={() => setEditing(undefined)}>Cancel</button>
          <button type="submit" className="primary-button" disabled={saving}>Save</button>
        </div>
      </form></div>}
    </section>
  );

  return (
    <section className="ads-browser" aria-label="Video Ads browser">
      <div className="ads-toolbar">
        <div className="ads-tabs" role="tablist" aria-label="Video type">
          {(["general", "branch"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={tab === value ? "active" : ""}
              onClick={() => {
                setTab(value);
                setSelectedBranches([]);
                setSelectedFolders([]);
                setPage(1);
              }}
            >
              {value === "general" ? "General" : "Branch"}
              <span>
                {displayedVideos.filter((video) => video.category === value).length}
              </span>
            </button>
          ))}
        </div>
        <div className="ads-search-wrap">
          <label className="ads-search">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search videos…"
            />
          </label>
          {query.trim() && (
            <p className="ads-count">
              {visible.length} {visible.length === 1 ? "video" : "videos"}
            </p>
          )}
        </div>
      </div>

      <div className="ads-layout">
        {tab === "general" && folderOptions.length > 1 && (
          <aside className="ads-filters" aria-label="Filter by folder">
            <div className="ads-filter-heading ads-filter-heading-first">
              <p className="ads-filter-title">Folder</p>
              {activeFolders.length > 0 && (
                <button type="button" onClick={() => { setSelectedFolders([]); setPage(1); }}>
                  Clear
                </button>
              )}
            </div>
            {shownFolders.map(([label]) => (
              <label key={label} className="ads-filter-option">
                <input
                  type="checkbox"
                  checked={activeFolders.includes(label)}
                  onChange={() => toggleFolder(label)}
                />{" "}
                <span>{label}</span>
              </label>
            ))}
            {folderOptions.length > VISIBLE_BRANCHES && (
              <button
                type="button"
                className="ads-filter-more"
                onClick={() => setShowAllFolders((current) => !current)}
              >
                {showAllFolders ? "Show less" : "Show more"}
              </button>
            )}
          </aside>
        )}
        {tab === "branch" && (
          <aside className="ads-filters" aria-label="Filter by location">
            <p className="ads-filter-title">Area</p>
            <label className="ads-filter-option">
              <input
                type="radio"
                name="ads-area"
                checked={area === "local"}
                onChange={() => chooseArea("local")}
              />{" "}
              <span>Branch</span>
            </label>
            <label className="ads-filter-option">
              <input
                type="radio"
                name="ads-area"
                checked={area === "overseas"}
                onChange={() => chooseArea("overseas")}
              />{" "}
              <span>Overseas</span>
            </label>
            <div className="ads-filter-divider" />
            <div className="ads-filter-heading">
              <p className="ads-filter-title">Location</p>
              {selectedBranches.length > 0 && (
                <button type="button" onClick={() => { setSelectedBranches([]); setPage(1); }}>
                  Clear
                </button>
              )}
            </div>
            {branches.length === 0 ? (
              <p className="ads-filter-empty">No locations.</p>
            ) : (
              shownBranches.map((name) => (
                <label key={name} className="ads-filter-option">
                  <input
                    type="checkbox"
                    checked={selectedBranches.includes(name)}
                    onChange={() => toggleBranch(name)}
                  />{" "}
                  <span>{branchLabel(name)}</span>
                </label>
              ))
            )}
            {branches.length > VISIBLE_BRANCHES && (
              <button
                type="button"
                className="ads-filter-more"
                onClick={() => setShowAllBranches((current) => !current)}
              >
                {showAllBranches ? "Show less" : "Show more"}
              </button>
            )}
          </aside>
        )}
        <div className="ads-results">
          {visible.length ? (
            <div className="ads-grid">
              {pagedVideos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  className="ads-card"
                  onClick={() => setActiveVideo(video)}
                >
                  <div className="ads-thumb">
                    <span className="ads-thumb-fallback" aria-hidden="true"><VideoIcon /></span>
                    <img src={video.thumbnail} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                    <span className="ads-play">
                      <VideoIcon />
                    </span>
                    {video.duration > 0 && (
                      <small>{formatDuration(video.duration)}</small>
                    )}
                  </div>
                  <div className="ads-card-copy">
                    <em className="ads-card-folder">{folderLabel(video.group || video.folder)}</em>
                    <strong title={videoTitle(video)}>{videoTitle(video)}</strong>
                    {video.description && <span>{video.description}</span>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="ads-empty">
              <VideoIcon />
              <strong>No videos found.</strong>
              <p>Try another search or location.</p>
            </div>
          )}
          {visible.length > PAGE_SIZE && <p className="ads-page-count">Showing {pagedVideos.length} of {visible.length} videos</p>}
          {hasMore && (
            <button
              type="button"
              className="ads-load-more"
              onClick={() => setPage((current) => current + 1)}
            >
              Load more
            </button>
          )}
        </div>
      </div>
      {activeVideo && (
        <VideoViewer
          video={activeVideo}
          onClose={() => setActiveVideo(undefined)}
        />
      )}
    </section>
  );
}

function VideoViewer({
  video,
  onClose,
}: {
  video: AdVideo & { displayTitle?: string | null };
  onClose: () => void;
}) {
  return (
    <div
      className="ads-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="ads-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ads-modal-title"
      >
        <div className="ads-modal-video">
          <iframe
            src={`https://drive.google.com/file/d/${video.id}/preview`}
            title={video.name}
            allow="autoplay"
          />
        </div>
        <aside className="ads-modal-copy">
          <button
            type="button"
            className="ads-modal-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            ×
          </button>
          <p className="eyebrow">VIDEO DETAILS</p>
          <h2 id="ads-modal-title">{videoTitle(video)}</h2>
          <dl>
            {video.duration > 0 && <div><dt>Duration</dt><dd>{formatDuration(video.duration)}</dd></div>}
            <div>
              <dt>Location</dt>
              <dd>
                {video.category === "branch"
                  ? branchLabel(video.branch)
                  : "General"}
              </dd>
            </div>
            <div>
              <dt>Folder</dt>
              <dd>{branchLabel(video.folder)}</dd>
            </div>
            <div>
              <dt>Description</dt>
              <dd>
                {video.description || "No description added in Google Drive."}
              </dd>
            </div>
          </dl>
          <a
            className="primary-button"
            href={video.url}
            target="_blank"
            rel="noreferrer"
          >
            Open in Drive <span aria-hidden="true">↗</span>
          </a>
        </aside>
      </section>
    </div>
  );
}
