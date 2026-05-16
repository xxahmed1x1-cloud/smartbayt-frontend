import { useEffect, useState } from "react";
import { settingsApi } from "@/api/other";

export interface Branding {
  site_name?: string;
  logo_url?: string | null;
  tagline?: string;
}

export function useBranding() {
  const [branding, setBranding] = useState<Branding>({ site_name: "سمارت فايب", logo_url: null });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await settingsApi.getByKey("branding");
        if (!cancelled && data?.value) {
          const val = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          setBranding({ site_name: "سمارت فايب", ...val });
        }
      } catch {}
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return branding;
}