import Link from "next/link";
import { AdminOnly } from "@/components/AdminOnly";
import { GridIcon, ImageIcon, VideoIcon } from "@/components/Icons";

const areas = [
  { href: "/library", title: "Design Library", text: "Edit, delete, upload, or add design files.", tone: "green", icon: <GridIcon /> },
  { href: "/manage-ads", title: "Video Library", text: "Edit or hide Drive videos.", tone: "purple", icon: <VideoIcon /> },
  { href: "/manage-static-ads", title: "Static Ads", text: "Edit titles and Figma links.", tone: "blue", icon: <ImageIcon /> },
];

export default function ManagePage() {
  return (
    <AdminOnly>
      <main className="content-inner ads-page">
        <header className="ads-header">
          <p className="eyebrow">MANAGE</p>
          <h2>What do you want to manage?</h2>
        </header>
        <div className="manage-grid">
          {areas.map((area) => (
            <Link key={area.href} href={area.href} className="manage-card">
              <span className={`nav-icon nav-icon-${area.tone} manage-icon`} aria-hidden="true">{area.icon}</span>
              <span className="manage-copy">
                <strong>{area.title}</strong>
                <small>{area.text}</small>
              </span>
              <span className="manage-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </main>
    </AdminOnly>
  );
}
