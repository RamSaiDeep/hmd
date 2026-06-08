"use client";

import { useState, useEffect } from "react";

type SettingsData = {
  COMPLAINT_ACCEPTANCE_LIMIT?: string;
  MUSIC_ACCEPTANCE_LIMIT?: string;
  EVENT_ACCEPTANCE_LIMIT?: string;
  STUDIO_ACCEPTANCE_LIMIT?: string;
};

export default function SettingsTab() {
  const [settings, setSettings] = useState<SettingsData>({
    COMPLAINT_ACCEPTANCE_LIMIT: "2",
    MUSIC_ACCEPTANCE_LIMIT: "5",
    EVENT_ACCEPTANCE_LIMIT: "5",
    STUDIO_ACCEPTANCE_LIMIT: "2",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...(data.settings || {}) }));
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        setMessage("Settings saved successfully!");
      } else {
        setMessage("Failed to save settings.");
      }
    } catch (error) {
      setMessage("Error saving settings.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-card-foreground">Acceptance Limits</h2>
      <p className="mt-1 text-sm text-muted-foreground mb-6">
        Configure the minimum number of member acceptances required before showing member names or locking requests.
      </p>

      {message && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800 border border-green-200">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4 items-center">
          <label className="text-sm font-medium text-foreground">Complaints Limit</label>
          <input
            type="number"
            min="1"
            value={settings.COMPLAINT_ACCEPTANCE_LIMIT}
            onChange={(e) => setSettings({ ...settings, COMPLAINT_ACCEPTANCE_LIMIT: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />

          <label className="text-sm font-medium text-foreground">Music Events Limit</label>
          <input
            type="number"
            min="1"
            value={settings.MUSIC_ACCEPTANCE_LIMIT}
            onChange={(e) => setSettings({ ...settings, MUSIC_ACCEPTANCE_LIMIT: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />

          <label className="text-sm font-medium text-foreground">Event Support Limit</label>
          <input
            type="number"
            min="1"
            value={settings.EVENT_ACCEPTANCE_LIMIT}
            onChange={(e) => setSettings({ ...settings, EVENT_ACCEPTANCE_LIMIT: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />

          <label className="text-sm font-medium text-foreground">Recording Studio / SRDRS Limit</label>
          <input
            type="number"
            min="1"
            value={settings.STUDIO_ACCEPTANCE_LIMIT}
            onChange={(e) => setSettings({ ...settings, STUDIO_ACCEPTANCE_LIMIT: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </section>
  );
}
