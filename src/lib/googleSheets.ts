// ============================================================
// Google Sheets Integration
// All trade data is saved to and loaded from your Google Sheet
// ============================================================

import { Trade } from "@/types/trade";

// Google Apps Script Web App URL — saved in browser localStorage once you connect
let APPS_SCRIPT_URL = localStorage.getItem("apps_script_url") || "";

export function setAppsScriptUrl(url: string) {
  APPS_SCRIPT_URL = url;
  localStorage.setItem("apps_script_url", url);
}

export function getAppsScriptUrl(): string {
  return APPS_SCRIPT_URL;
}

// ── READ all trades from Google Sheet ──────────────────────
export async function fetchTradesFromSheet(): Promise<Trade[]> {
  if (!APPS_SCRIPT_URL) return [];

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getTrades`, {
      method: "GET",
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.trades)) {
      // Filter out any rows with missing/invalid dates so a single bad
      // row in the sheet can never crash the app.
      return data.trades.filter((t: Trade) => t.date && t.id);
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch trades:", err);
    return [];
  }
}

// ── ADD a new trade to Google Sheet ────────────────────────
export async function addTradeToSheet(trade: Trade): Promise<boolean> {
  if (!APPS_SCRIPT_URL) return false;

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "addTrade", trade }),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Failed to add trade:", err);
    return false;
  }
}

// ── UPDATE an existing trade in Google Sheet ───────────────
export async function updateTradeInSheet(trade: Trade): Promise<boolean> {
  if (!APPS_SCRIPT_URL) return false;

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "updateTrade", trade }),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Failed to update trade:", err);
    return false;
  }
}

// ── DELETE a trade from Google Sheet ───────────────────────
export async function deleteTradeFromSheet(id: string): Promise<boolean> {
  if (!APPS_SCRIPT_URL) return false;

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "deleteTrade", id }),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Failed to delete trade:", err);
    return false;
  }
}
