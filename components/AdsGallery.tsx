"use client";

import { useMemo, useState } from "react";
import type { AdVideo } from "@/lib/googleDrive";
import { SearchIcon, VideoIcon } from "./Icons";

type Props = { videos: AdVideo[] };

const formatDuration = (seconds: number) => seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "";

export default function AdsGallery({ videos }: Props) {
  const [tab, setTab] = useState<AdVideo["category"]>("general");
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("all");
  const branches = useMemo(() => [...new Set(videos.filter((video) => video.category === "branch").map((video) => video.branch).filter(Boolean))].sort(), [videos]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return videos.filter((video) => video.category === tab && (tab !== "branch" || branch === "all" || video.branch === branch) && (!needle || `${video.name} ${video.folder} ${video.branch}`.toLowerCase().includes(needle)));
  }, [branch, query, tab, videos]);

  return (
    <section className="ads-browser" aria-label="Video Ads browser">
      <div className="ads-toolbar">
        <div className="ads-tabs" role="tablist" aria-label="Video type">
          {(["general", "branch"] as const).map((value) => <button key={value} type="button" role="tab" aria-selected={tab === value} className={tab === value ? "active" : ""} onClick={() => { setTab(value); setBranch("all"); }}>{value === "general" ? "General" : "Branch"}<span>{videos.filter((video) => video.category === value).length}</span></button>)}
        </div>
        {tab === "branch" && (
          <select className="ads-branch-select" aria-label="Filter by branch" value={branch} onChange={(event) => setBranch(event.target.value)}>
            <option value="all">All branches</option>
            {branches.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        )}
        <label className="ads-search"><SearchIcon /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tab === "branch" ? "Search branch or video…" : "Search videos…"} /></label>
      </div>
      <p className="ads-count">{visible.length} {visible.length === 1 ? "video" : "videos"}</p>
      {visible.length ? <div className="ads-grid">{visible.map((video) => <a key={video.id} href={video.url} target="_blank" rel="noreferrer" className="ads-card"><div className="ads-thumb"><img src={video.thumbnail} alt="" /><span className="ads-play"><VideoIcon /></span>{video.duration > 0 && <small>{formatDuration(video.duration)}</small>}</div><div className="ads-card-copy"><strong>{video.name.replace(/\.[^.]+$/, "")}</strong><span>{video.category === "branch" ? video.branch : "General"} · {video.folder}</span></div></a>)}</div> : <div className="ads-empty"><VideoIcon /><strong>No videos found.</strong><p>Try another search or branch.</p></div>}
    </section>
  );
}
