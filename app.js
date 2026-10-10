const API_BASE = "http://localhost:5000/api";

let cachedMembers = [];
let cachedBooks = [];
let cachedUnreturnedBorrows = [];
let rfid, regRfid, returnRfid;

async function apiFetch(path, options = {}) {
  const url = API_BASE + path;
  const defaults = { headers: { "Content-Type": "application/json" } };
  const config = { ...defaults, ...options };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (response.status === 204) return null;

  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!response.ok) {
    throw new Error(typeof data === "string" ? data : JSON.stringify(data));
  }

  return data;
}