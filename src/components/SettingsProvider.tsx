"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface SiteSettings {
  siteName: string;
  siteLogo: string | null;
  tagline: string;
  whatsappNumber: string | null;
  currency: string;
}

const SettingsCtx = createContext<SiteSettings>({
  siteName: "DataHub Ghana",
  siteLogo: null,
  tagline: "Fast & Reliable Data Bundles",
  whatsappNumber: null,
  currency: "GHS",
});

export function useSettings() {
  return useContext(SettingsCtx);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "DataHub Ghana",
    siteLogo: null,
    tagline: "Fast & Reliable Data Bundles",
    whatsappNumber: null,
    currency: "GHS",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  return (
    <SettingsCtx.Provider value={settings}>{children}</SettingsCtx.Provider>
  );
}
