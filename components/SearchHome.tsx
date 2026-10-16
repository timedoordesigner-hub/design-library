"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useDesigns } from "./DesignsProvider";
import { GridIcon, SearchIcon } from "./Icons";

const hints = ["keyword", "judul", "category", "media type"];

export function SearchHome() {
  const router = useRouter();
  const { designs, loading } = useDesigns();
  const [value, setValue] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const q = value.trim();
    router.push(q ? `/thumbnail?q=${encodeURIComponent(q)}` : "/thumbnail");
  };

  return (
    <main className="search-home">
      <p className="eyebrow">Design Library</p>
      <h2 className="search-home-title">Cari design Timedoor Academy</h2>
      <p className="search-home-hint">
        Ketik di sini untuk mencari design berdasarkan{" "}
        {hints.map((hint, index) => (
          <span key={hint}>
            <b>{hint}</b>
            {index < hints.length - 2 ? ", " : index === hints.length - 2 ? " atau " : ""}
          </span>
        ))}
        .
      </p>
      <form className="search-home-form" role="search" onSubmit={submit}>
        <SearchIcon />
        <input
          autoFocus
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Contoh: roadmap, banner, courses…"
          aria-label="Cari design"
          autoComplete="off"
        />
        <button type="submit" className="primary-button">Cari</button>
      </form>
      <Link href="/thumbnail" className="search-home-link">
        <GridIcon />
        Lihat semua thumbnail{!loading && ` (${designs.length})`}
        <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}
