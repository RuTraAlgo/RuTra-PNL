// ============================================================
// Setup Banner — shown when Apps Script URL is not yet set
// Guides user to complete the one-time Google Sheets setup
// ============================================================

import { useState } from "react";
import { setAppsScriptUrl, getAppsScriptUrl } from "@/lib/googleSheets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function SetupBanner({ onSetup }: { onSetup: () => void }) {
  const [url, setUrl] = useState(getAppsScriptUrl());
  const [show, setShow] = useState(!getAppsScriptUrl());
  const [saving, setSaving] = useState(false);

  if (!show) return null;

  async function handleSave() {
    if (!url.startsWith("https://script.google.com")) {
      toast.error("Please paste a valid Google Apps Script URL");
      return;
    }
    setSaving(true);
    setAppsScriptUrl(url);
    toast.success("Google Sheets connected! Loading your trades...");
    setSaving(false);
    setShow(false);
    onSetup();
  }

  return (
    <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 mb-4">
      <h3 className="font-semibold text-yellow-400 mb-1">⚙️ One-Time Setup Required</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Paste your Google Apps Script URL below to connect your Google Sheet as the database.
      </p>
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://script.google.com/macros/s/..."
          className="text-xs"
        />
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? "Saving..." : "Connect"}
        </Button>
      </div>
    </div>
  );
}
