import type { CSSProperties } from "react";
import type { Design } from "@/lib/designs";
import { toneOf } from "@/lib/taxonomy";

type Props = {
  design: Design;
  compact?: boolean;
};

export function Thumb({ design, compact = false }: Props) {
  const tone = toneOf(design.category);
  const [base, accent, surface] = [tone.base, tone.accent, tone.soft];
  const style = { "--thumb-base": base, "--thumb-accent": accent, "--thumb-surface": surface, aspectRatio: `${design.w} / ${design.h}` } as CSSProperties;

  if (design.image) {
    return (
      <div className={`thumb thumb-image ${compact ? "thumb-compact" : ""}`} style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={design.image} alt={`Preview ${design.nama}`} />
      </div>
    );
  }

  return (
    <div className={`thumb ${compact ? "thumb-compact" : ""}`} style={style} aria-label={`Preview ${design.preview}`} role="img">
      <div className="thumb-topline" />
      <div className="thumb-copy">
        <span className="thumb-kicker">TIMEDOR ACADEMY</span>
        <span className="thumb-title">{design.nama}</span>
      </div>
      <div className="thumb-shape" />
      <span className="sr-only">{design.preview}</span>
    </div>
  );
}
