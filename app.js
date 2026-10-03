const API_BASE = "http://localhost:5000/api";

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

async function loadBooks() {                                           // Function for loading books from API
  try {                                                                // Start error handling block
    const books = await apiFetch("/books");                            // Call GET /api/books and wait for result
    const tbody = document.querySelector("#table-books tbody");        // Select the table body for books
    tbody.innerHTML = "";                                              // Clear old table rows

    books.forEach(b => {                                               // Loop through each book object
      const row = document.createElement("tr");                        // Create a new table row
      row.innerHTML = `
        <td>${b.id}</td>
        <td>${b.title}</td>
        <td>${b.author}</td>
        <td>${b.isbn}</td>
        <td><span class="badge ${b.isAvailable ? "badge-green" : "badge-red"}">${b.isAvailable ? "Yes" : "No"}</span></td>
        <td><button class="btn-delete" data-id="${b.id}">Delete</button></td>
      `;

      row.querySelector(".btn-delete")                                 // Find the Delete button in this row
        .addEventListener("click", () => deleteBook(b.id));            // When clicked, delete this book by ID

      tbody.appendChild(row);                                          // Add the row to the table
    });
  } catch (err) {                                                      // Run if API call fails
    showToast("Could not load books: " + err.message, "error");        // Show error message
  }
}

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");

    if (btn.dataset.tab === "borrowing") {   // Opening the Borrowing tab
      refreshMemberCache();                  // Get the newest members for RFID lookup
      populateBorrowBookDropdown();          // Fill the Borrow dropdown
      populateReturnDropdown();              // Fill the Return dropdown
    }
  });
});

async function loadMembers() {                                          // Function for loading members from API
  try {                                                                 // Start error handling block
    const members = await apiFetch("/members");                         // Call GET /api/members
    const tbody = document.querySelector("#table-members tbody");       // Select members table body
    tbody.innerHTML = "";                                               // Clear old member rows

    members.forEach(m => {                                              // Loop through each member
      const row = document.createElement("tr");                         // Create table row

      const rfidDisplay = m.rfidValue                                   // Check if member has RFID value
        ? `<span class="rfid-tag">${m.rfidValue}</span>`                // Show RFID value if present
        : '<span style="color:#a0aec0">—</span>';                       // Show dash if no RFID value

      row.innerHTML = `
        <td>${m.id}</td>
        <td>${m.name}</td>
        <td>${m.studentId}</td>
        <td class="rfid-value-cell">
          ${rfidDisplay}
          <button class="btn-set-rfid" title="Assign RFID card">&#9998; Set</button>
        </td>
        <td>${m.email}</td>
        <td><button class="btn-delete" data-id="${m.id}">Delete</button></td>
      `;

      row.querySelector(".btn-delete")                                  // Find Delete button
        .addEventListener("click", () => deleteMember(m.id));           // Delete selected member

      row.querySelector(".btn-set-rfid")                                // Find Set RFID button
        .addEventListener("click", () =>                                // When clicked, open inline editor
          openInlineRfidEditor(m, row.querySelector(".rfid-value-cell")) // Pass member and RFID cell
        );

      tbody.appendChild(row);                                           // Add row to table
    });
  } catch (err) {                                                       // Run if API call fails
    showToast("Could not load members: " + err.message, "error");      // Show error message
  }
}

let cachedBooks = [];                                                   // Stores latest books from API

async function refreshBookCache() {                                     // Function updates book cache
  try {                                                                 // Start error handling block
    cachedBooks = await apiFetch("/books");                             // Load books from API into cache
  } catch {                                                             // Run if API call fails
    cachedBooks = [];                                                   // Use empty array to avoid errors
  }
}