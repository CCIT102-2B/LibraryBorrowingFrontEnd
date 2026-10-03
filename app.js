const API_BASE = "http://localhost:5000/api"; // Base address of the API
async function apiFetch(path, options = {}) {                         // Create reusable async API helper
  const url = API_BASE + path;                                        // Combine base URL and endpoint path
  const defaults = { headers: { "Content-Type": "application/json" } }; // Default request header for JSON
  const config = { ...defaults, ...options };                         // Merge defaults with custom options

  if (config.body && typeof config.body === "object") {               // Check if body is a JS object
    config.body = JSON.stringify(config.body);                         // Convert JS object to JSON string
  }

  const response = await fetch(url, config);                           // Send the HTTP request to the API

  if (response.status === 204) return null;                            // Return null if API has no response body

  const text = await response.text();                                  // Read response body as plain text first
  let data;                                                            // Prepare variable for parsed response
  try { data = JSON.parse(text); } catch { data = text; }              // Convert JSON text to object if possible

  if (!response.ok) {                                                  // Check if status is not 200–299
    throw new Error(typeof data === "string" ? data : JSON.stringify(data)); // Convert API error into JS Error
  }

  return data;                                                         // Return parsed data to the caller
}
