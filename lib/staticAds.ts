"use client";

import { useEffect, useState } from "react";
import type { StaticAd } from "./googleDrive";
import { supabase } from "./supabase";

export type StaticAdSetting = {
  ad_id: string;
  title: string | null;
  description: string | null;
  figma_url: string | null;
  hidden: boolean;
};

// Drive file name -> readable design name ("Design - ADS Motion.png" -> "ADS Motion").
export const defaultTitle = (name: string) =>
  name
    .replace(/\.[^.]+$/, "")
    .replace(/^(design|edit)\s*[-–]\s*/i, "")
    .replace(/_+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const adTitle = (ad: StaticAd, setting?: StaticAdSetting) => setting?.title || defaultTitle(ad.name);

export const isFigmaUrl = (value: string) => /^https:\/\//i.test(value);

// null while loading; [] when the table is missing so the public page still works.
export function useStaticAdSettings() {
  const [settings, setSettings] = useState<StaticAdSetting[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => supabase().from("static_ad_settings").select("ad_id,title,description,figma_url,hidden"))
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setError("Static ad settings are unavailable. Run the static_ad_settings SQL in supabase/schema.sql.");
        setSettings(err ? [] : (data as StaticAdSetting[]));
      })
      .catch(() => {
        if (!active) return;
        setError("Static ad settings are unavailable.");
        setSettings([]);
      });
    return () => {
      active = false;
    };
  }, []);
  return { settings, setSettings, error };
}
