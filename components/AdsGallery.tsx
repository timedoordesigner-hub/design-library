"use client";

import { useMemo, useState } from "react";
import type { AdVideo } from "@/lib/googleDrive";
import { SearchIcon, VideoIcon } from "./Icons";

type Props = { videos: AdVideo[] };

const formatDuration = (seconds: number) =>
  seconds
    ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
    : "";

const VISIBLE_BRANCHES = 8;

const branchLabel = (name: string) => name.replace(/^\d+[\s._-]*/, "");

export default function AdsGallery({ videos }: Props) {
  const [tab, setTab] = useState<AdVideo["category"]>("general");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<AdVideo["area"]>("local");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [activeVideo, setActiveVideo] = useState<AdVideo>();
  const branchVideos = useMemo(
    () =>
      videos.filter(
        (video) => video.category === "branch" && video.area === area,
      ),
    [area, videos],
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
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return videos.filter((video) => {
      if (video.category !== tab) return false;
      if (tab === "branch" && video.area !== area) return false;
      if (
        tab === "branch" &&
        selectedBranches.length > 0 &&
        !selectedBranches.includes(video.branch)
      )
        return false;
      return (
        !needle ||
        `${video.name} ${video.folder} ${video.branch} ${video.description}`
          .toLowerCase()
          .includes(needle)
      );
    });
  }, [area, query, selectedBranches, tab, videos]);

  const chooseArea = (value: AdVideo["area"]) => {
    setArea(value);
    setSelectedBranches([]);
  };

  const toggleBranch = (value: string) => {
    setSelectedBranches((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

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
              }}
            >
              {value === "general" ? "General" : "Branch"}
              <span>
                {videos.filter((video) => video.category === value).length}
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
              onChange={(event) => setQuery(event.target.value)}
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
              <p className="ads-filter-title">Lokasi</p>
              {selectedBranches.length > 0 && (
                <button type="button" onClick={() => setSelectedBranches([])}>
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
                {showAllBranches ? "Lebih sedikit" : "Lainnya"}
              </button>
            )}
          </aside>
        )}
        <div className="ads-results">
          {visible.length ? (
            <div className="ads-grid">
              {visible.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  className="ads-card"
                  onClick={() => setActiveVideo(video)}
                >
                  <div className="ads-thumb">
                    <img src={video.thumbnail} alt="" />
                    <span className="ads-play">
                      <VideoIcon />
                    </span>
                    {video.duration > 0 && (
                      <small>{formatDuration(video.duration)}</small>
                    )}
                  </div>
                  <div className="ads-card-copy">
                    <strong>{video.name.replace(/\.[^.]+$/, "")}</strong>
                    <span>
                      {video.category === "branch"
                        ? branchLabel(video.branch)
                        : "General"}{" "}
                      · {video.folder}
                    </span>
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
  video: AdVideo;
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
          <h2 id="ads-modal-title">{video.name.replace(/\.[^.]+$/, "")}</h2>
          <dl>
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
              <dd>{video.folder}</dd>
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
