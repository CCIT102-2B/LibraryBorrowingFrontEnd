# Activity Sheet with Code: Connect the Library Frontend to the API

## Activity Title
**Library Borrowing System — API to Frontend Implementation**

## Objective
Students will complete `FrontEnd/app.js` by writing JavaScript code that connects the HTML frontend to the .NET Web API.

This activity uses:

```js
fetch()              // Browser function for calling an API
async / await        // Used to wait for API responses
try / catch          // Used to handle errors
GET                  // Read data
POST                 // Add data
PUT                  // Update data
DELETE               // Remove data
DOM manipulation     // Update HTML using JavaScript
RFID scanning        // Match RFID value to a registered member
```

---

# How to Copy the Code

Each code section now has **two** blocks:

1. **Clean code block** (shown first). Use its **Copy** button. It contains only code, with no comments, so it is safe to paste into `app.js`.
2. **"Line-by-line explanation"** (shown right after). This is the same code with comments. Read it to learn, but do not copy from it.

---

# Prerequisites — Install and Check Before Starting

Check each item first. Install only what is missing.

| Need | Why | Check (run in a terminal) | Expected |
|---|---|---|---|
| .NET SDK | Runs the Web API (`dotnet run`) | `dotnet --version` | A version number such as `8.0.x` |
| Web browser (Chrome / Edge) | Opens `index.html` and shows console errors | Open the browser, press `F12` | DevTools opens |
| Code editor (VS Code recommended) | Editing `app.js` | `code --version` | A version number |

Node.js is **not** required for this activity.

## 1. Check .NET

```bash
dotnet --version        # Shows the installed SDK version
dotnet --list-sdks      # Lists every installed SDK
```

If you see `'dotnet' is not recognized`, install it (next step).

Also match the SDK to the API project. Open `API/*.csproj` and look for:

```xml
<TargetFramework>net8.0</TargetFramework>
```

Install an SDK with the same major version (`net8.0` needs SDK 8.x).

## 2. Install .NET SDK (only if missing)

Windows (PowerShell or Command Prompt):

```powershell
winget install Microsoft.DotNet.SDK.8
```

No `winget`? Download the installer from https://dotnet.microsoft.com/download and run it.

macOS / Linux:

```bash
brew install --cask dotnet-sdk                  # macOS (Homebrew)
sudo apt-get install -y dotnet-sdk-8.0          # Ubuntu / Debian
```

After installing, **close and reopen the terminal**, then run `dotnet --version` again.

## 3. Find the real API port

The port is not always `5000`. Start the API and read the console:

```bash
cd API
dotnet run
```

Look for a line like:

```txt
Now listening on: http://localhost:5000
```

If the port is different (for example `5123`), change `API_BASE` in `app.js` to match the port printed by `dotnet run`:

```js
const API_BASE = "http://localhost:5123/api";
```

## 4. Prove the API works before touching the frontend

Open this in the browser (use your port):

```txt
http://localhost:5000/api/books
```

You should see JSON. If you do not, fix the API first. The frontend cannot work without it.

## 5. CORS (only if the browser console shows a CORS error)

If DevTools (`F12` → Console) shows `blocked by CORS policy`, the API is not allowing browser requests from the page. This is an API setting, so ask your instructor to enable it. The API needs, in `Program.cs`, this line before `var app = builder.Build();` (it allows browser calls):

```csharp
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
```

Then add this line after `var app = builder.Build();`:

```csharp
app.UseCors();
```

---

# Project Files

Students will work inside:

```txt
C:\Users\manal\OneDrive\Documents\Study\FrontEnd
```

Main file to edit:

```txt
FrontEnd/app.js
```

Do not edit the API code during this activity. Your task is to connect the existing frontend template to the running API.

---

# API Base URL

At the top of `app.js`, use:

```js
const API_BASE = "http://localhost:5000/api";
```

When you write:

```js
apiFetch("/books") // Calls http://localhost:5000/api/books
```

---

# Provided Helper Code: `apiFetch()`

Use this helper for all API calls.

```js
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
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
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
```

## Brief Explanation

`apiFetch()` prevents repeated code. Instead of writing a long `fetch()` call every time, students call:

```js
apiFetch("/books") // Short and reusable API call
```

---

# Part 1 — Load Books into Table

## Endpoint

```txt
GET /api/books
```

## Complete Code with Brief Line-by-Line Explanation

```js
async function loadBooks() {
  try {
    const books = await apiFetch("/books");
    const tbody = document.querySelector("#table-books tbody");
    tbody.innerHTML = "";

    books.forEach(b => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${b.id}</td>
        <td>${b.title}</td>
        <td>${b.author}</td>
        <td>${b.isbn}</td>
        <td><span class="badge ${b.isAvailable ? "badge-green" : "badge-red"}">
              ${b.isAvailable ? "Yes" : "No"}
            </span></td>
        <td><button class="btn-delete" data-id="${b.id}">Delete</button></td>
      `;

      row.querySelector(".btn-delete")
        .addEventListener("click", () => deleteBook(b.id));

      tbody.appendChild(row);
    });
  } catch (err) {
    showToast("Could not load books: " + err.message, "error");
  }
}
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
async function loadBooks() {                                           // Function for loading books from API
  try {                                                                // Start error handling block
    const books = await apiFetch("/books");                            // Call GET /api/books and wait for result
    const tbody = document.querySelector("#table-books tbody");        // Select the table body for books
    tbody.innerHTML = "";                                              // Clear old table rows

    books.forEach(b => {                                               // Loop through each book object
      const row = document.createElement("tr");                        // Create a new table row
      row.innerHTML = `
        <td>${b.id}</td>                                               <!-- Display book ID -->
        <td>${b.title}</td>                                            <!-- Display book title -->
        <td>${b.author}</td>                                           <!-- Display book author -->
        <td>${b.isbn}</td>                                             <!-- Display book ISBN -->
        <td><span class="badge ${b.isAvailable ? "badge-green" : "badge-red"}">
              ${b.isAvailable ? "Yes" : "No"}                         <!-- Display availability -->
            </span></td>
        <td><button class="btn-delete" data-id="${b.id}">Delete</button></td> <!-- Delete button -->
      `;

      row.querySelector(".btn-delete")                                 // Find the Delete button in this row
        .addEventListener("click", () => deleteBook(b.id));            // When clicked, delete this book by ID

      tbody.appendChild(row);                                          // Add the row to the table
    });
  } catch (err) {                                                       // Run if API call fails
    showToast("Could not load books: " + err.message, "error");        // Show error message
  }
}
```

## Student Task
Replace the TODO inside `loadBooks()` with the code above.

---

# Part 2 — Delete Book

## Endpoint

```txt
DELETE /api/books/{id}
```

## Complete Code with Brief Line-by-Line Explanation

```js
async function deleteBook(id) {
  if (!confirm(`Delete book ID ${id}?`)) return;

  try {
    await apiFetch(`/books/${id}`, {
      method: "DELETE"
    });

    showToast("Book deleted.");
    loadBooks();
    populateBorrowBookDropdown();
  } catch (err) {
    showToast(err.message, "error");
  }
}
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
async function deleteBook(id) {                                        // Function receives the book ID
  if (!confirm(`Delete book ID ${id}?`)) return;                       // Ask user to confirm before deleting

  try {                                                                // Start error handling block
    await apiFetch(`/books/${id}`, {                                   // Call /api/books/{id}
      method: "DELETE"                                                 // Use DELETE HTTP method
    });

    showToast("Book deleted.");                                        // Show success message
    loadBooks();                                                       // Reload books table
    populateBorrowBookDropdown();                                      // Reload borrow dropdown
  } catch (err) {                                                       // Run if API call fails
    showToast(err.message, "error");                                   // Show API error message
  }
}
```

## Student Task
Replace the TODO inside `deleteBook(id)` with the code above.

---

# Part 3 — Add Book

## Endpoint

```txt
POST /api/books
```

## Complete Code with Brief Line-by-Line Explanation

```js
document.getElementById("form-add-book").addEventListener("submit", async e => {
  e.preventDefault();

  const book = {
    title: document.getElementById("book-title").value.trim(),
    author: document.getElementById("book-author").value.trim(),
    isbn: document.getElementById("book-isbn").value.trim()
  };

  try {
    await apiFetch("/books", {
      method: "POST",
      body: book
    });

    showToast("Book added!");
    e.target.reset();
    loadBooks();
    populateBorrowBookDropdown();
  } catch (err) {
    showToast(err.message, "error");
  }
});
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
document.getElementById("form-add-book").addEventListener("submit", async e => { // Listen for Add Book form submit
  e.preventDefault();                                                   // Stop page from refreshing

  const book = {                                                        // Create object to send to API
    title: document.getElementById("book-title").value.trim(),          // Read title input
    author: document.getElementById("book-author").value.trim(),        // Read author input
    isbn: document.getElementById("book-isbn").value.trim()             // Read ISBN input
  };

  try {                                                                 // Start error handling block
    await apiFetch("/books", {                                          // Call POST /api/books
      method: "POST",                                                  // Use POST to add data
      body: book                                                        // Send book object as JSON
    });

    showToast("Book added!");                                          // Show success message
    e.target.reset();                                                   // Clear the form inputs
    loadBooks();                                                        // Reload books table
    populateBorrowBookDropdown();                                       // Reload dropdown with new book
  } catch (err) {                                                        // Run if API call fails
    showToast(err.message, "error");                                    // Show error message
  }
});
```

## Student Task
Replace the TODO inside the Add Book form submit listener with the code above.

---

# Part 4 — Load Members into Table

## Endpoint

```txt
GET /api/members
```

## Complete Code with Brief Line-by-Line Explanation

```js
async function loadMembers() {
  try {
    const members = await apiFetch("/members");
    const tbody = document.querySelector("#table-members tbody");
    tbody.innerHTML = "";

    members.forEach(m => {
      const row = document.createElement("tr");

      const rfidDisplay = m.rfidValue
        ? `<span class="rfid-tag">${m.rfidValue}</span>`
        : '<span style="color:#a0aec0">—</span>';

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

      row.querySelector(".btn-delete")
        .addEventListener("click", () => deleteMember(m.id));

      row.querySelector(".btn-set-rfid")
        .addEventListener("click", () =>
          openInlineRfidEditor(m, row.querySelector(".rfid-value-cell"))
        );

      tbody.appendChild(row);
    });
  } catch (err) {
    showToast("Could not load members: " + err.message, "error");
  }
}
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
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
        <td>${m.id}</td>                                                <!-- Display member ID -->
        <td>${m.name}</td>                                              <!-- Display name -->
        <td>${m.studentId}</td>                                         <!-- Display student ID -->
        <td class="rfid-value-cell">                                   <!-- RFID value cell -->
          ${rfidDisplay}                                                <!-- Show RFID value or dash -->
          <button class="btn-set-rfid" title="Assign RFID card">&#9998; Set</button> <!-- Set RFID button -->
        </td>
        <td>${m.email}</td>                                             <!-- Display email -->
        <td><button class="btn-delete" data-id="${m.id}">Delete</button></td> <!-- Delete button -->
      `;

      row.querySelector(".btn-delete")                                  // Find Delete button
        .addEventListener("click", () => deleteMember(m.id));           // Delete selected member

      row.querySelector(".btn-set-rfid")                                // Find Set RFID button
        .addEventListener("click", () =>                                // When clicked, open inline editor
          openInlineRfidEditor(m, row.querySelector(".rfid-value-cell")) // Pass member and RFID cell
        );

      tbody.appendChild(row);                                           // Add row to table
    });
  } catch (err) {                                                        // Run if API call fails
    showToast("Could not load members: " + err.message, "error");       // Show error message
  }
}
```

## Student Task
Replace the TODO inside `loadMembers()` with the code above.

---

# Part 5 — Delete Member

## Endpoint

```txt
DELETE /api/members/{id}
```

## Complete Code with Brief Line-by-Line Explanation

```js
async function deleteMember(id) {
  if (!confirm(`Delete member ID ${id}?`)) return;

  try {
    await apiFetch(`/members/${id}`, {
      method: "DELETE"
    });

    showToast("Member deleted.");
    loadMembers();
    await refreshMemberCache();
  } catch (err) {
    showToast(err.message, "error");
  }
}
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
async function deleteMember(id) {                                       // Function receives member ID
  if (!confirm(`Delete member ID ${id}?`)) return;                      // Ask confirmation before deleting

  try {                                                                 // Start error handling block
    await apiFetch(`/members/${id}`, {                                  // Call /api/members/{id}
      method: "DELETE"                                                  // Use DELETE method
    });

    showToast("Member deleted.");                                       // Show success message
    loadMembers();                                                      // Reload members table
    await refreshMemberCache();                                         // Refresh RFID lookup cache
  } catch (err) {                                                        // Run if API call fails
    showToast(err.message, "error");                                    // Show error message
  }
}
```

## Student Task
Replace the TODO inside `deleteMember(id)` with the code above.

---

# Part 6 — Add Member with RFID Value

## Endpoint

```txt
POST /api/members
```

## Complete Code with Brief Line-by-Line Explanation

```js
document.getElementById("form-add-member").addEventListener("submit", async e => {
  e.preventDefault();

  const member = {
    name: document.getElementById("member-name").value.trim(),
    studentId: document.getElementById("member-studentid").value.trim(),
    email: document.getElementById("member-email").value.trim(),
    rfidValue: document.getElementById("member-rfidvalue").value.trim()
  };

  try {
    await apiFetch("/members", {
      method: "POST",
      body: member
    });

    showToast("Member added!");
    e.target.reset();
    regRfid.reset();
    loadMembers();
    await refreshMemberCache();
  } catch (err) {
    showToast(err.message, "error");
  }
});
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
document.getElementById("form-add-member").addEventListener("submit", async e => { // Listen for Add Member submit
  e.preventDefault();                                                   // Stop page reload

  const member = {                                                      // Create member object for API
    name: document.getElementById("member-name").value.trim(),          // Read name input
    studentId: document.getElementById("member-studentid").value.trim(), // Read student ID input
    email: document.getElementById("member-email").value.trim(),        // Read email input
    rfidValue: document.getElementById("member-rfidvalue").value.trim() // Read RFID value input
  };

  try {                                                                 // Start error handling block
    await apiFetch("/members", {                                        // Call POST /api/members
      method: "POST",                                                  // Use POST to add data
      body: member                                                      // Send member object as JSON
    });

    showToast("Member added!");                                        // Show success message
    e.target.reset();                                                   // Clear form inputs
    regRfid.reset();                                                    // Reset RFID registration widget
    loadMembers();                                                      // Reload members table
    await refreshMemberCache();                                         // Refresh RFID lookup cache
  } catch (err) {                                                        // Run if API call fails
    showToast(err.message, "error");                                    // Show error message
  }
});
```

## Student Task
Replace the TODO inside the Add Member form submit listener with the code above.

---

# Part 7 — Update Existing Member RFID

## Endpoint

```txt
PUT /api/members/{id}
```

## Complete Code with Brief Line-by-Line Explanation

```js
async function saveRfid() {
  const newRfid = input.value.trim();

  if (!newRfid) {
    showToast("Scan or type an RFID value first.", "error");
    return;
  }

  try {
    await apiFetch(`/members/${member.id}`, {
      method: "PUT",
      body: {
        name: member.name,
        studentId: member.studentId,
        email: member.email,
        rfidValue: newRfid
      }
    });

    showToast(`RFID set for ${member.name}`);
    loadMembers();
    refreshMemberCache();
  } catch (err) {
    showToast(err.message, "error");
    loadMembers();
  }
}
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
async function saveRfid() {                                             // Function saves new RFID value
  const newRfid = input.value.trim();                                   // Read typed/scanned RFID value

  if (!newRfid) {                                                       // Check if RFID value is empty
    showToast("Scan or type an RFID value first.", "error");            // Show validation message
    return;                                                             // Stop function
  }

  try {                                                                 // Start error handling block
    await apiFetch(`/members/${member.id}`, {                           // Call PUT /api/members/{id}
      method: "PUT",                                                   // Use PUT to update full record
      body: {                                                           // Send full member object
        name: member.name,                                              // Keep existing name
        studentId: member.studentId,                                    // Keep existing student ID
        email: member.email,                                            // Keep existing email
        rfidValue: newRfid                                              // Update RFID value
      }
    });

    showToast(`RFID set for ${member.name}`);                           // Show success message
    loadMembers();                                                      // Reload members table
    refreshMemberCache();                                               // Refresh RFID lookup cache
  } catch (err) {                                                        // Run if API call fails
    showToast(err.message, "error");                                    // Show error message
    loadMembers();                                                      // Restore table display
  }
}
```

## Where this code goes

`saveRfid()` uses `input` and `member`, which only exist inside `openInlineRfidEditor(member, cell)`. Put this function **inside** `openInlineRfidEditor`, replacing the TODO in the existing `saveRfid()`. Pasting it at the top level causes `input is not defined`.

## Important Explanation

`PUT` updates the whole member record. That is why the body must include:

```js
name       // Existing value
studentId  // Existing value
email      // Existing value
rfidValue  // New value
```

---

# Part 8 — Refresh Member Cache

> **Already provided in the template.** `app.js` already contains this code. Read it, but do **not** paste it again. Declaring it twice causes `Identifier '...' has already been declared` and the whole script stops.

## Complete Code with Brief Line-by-Line Explanation

```js
let cachedMembers = [];

async function refreshMemberCache() {
  try {
    cachedMembers = await apiFetch("/members");
  } catch {
    cachedMembers = [];
  }
}
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
let cachedMembers = [];                                                 // Stores latest members from API

async function refreshMemberCache() {                                   // Function updates member cache
  try {                                                                 // Start error handling block
    cachedMembers = await apiFetch("/members");                         // Load members from API into cache
  } catch {                                                             // Run if API call fails
    cachedMembers = [];                                                 // Use empty array to avoid errors
  }
}
```

## Explanation

The RFID scanner uses `cachedMembers` to find the member with matching `rfidValue`.

---

# Part 9 — Find Member by RFID Value

> **Already provided in the template.** `app.js` already contains this code. Read it, but do **not** paste it again. Declaring it twice causes `Identifier '...' has already been declared` and the whole script stops.

## Complete Code with Brief Line-by-Line Explanation

```js
function findMemberByRFID(scannedValue) {
  const trimmed = scannedValue.trim();

  return cachedMembers.find(
    m => m.rfidValue &&
         m.rfidValue.toLowerCase() === trimmed.toLowerCase()
  ) || null;
}
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
function findMemberByRFID(scannedValue) {                               // Function receives scanned RFID value
  const trimmed = scannedValue.trim();                                  // Remove extra spaces

  return cachedMembers.find(                                            // Search members array
    m => m.rfidValue &&                                                 // Make sure member has RFID value
         m.rfidValue.toLowerCase() === trimmed.toLowerCase()            // Compare RFID values case-insensitively
  ) || null;                                                            // Return found member or null
}
```

## Important Explanation

RFID matching must use:

```js
m.rfidValue
```

Do not match against:

```js
m.studentId
m.id
```

---

# Part 10 — Refresh Book Cache

> **Already provided in the template.** `app.js` already contains this code. Read it, but do **not** paste it again. Declaring it twice causes `Identifier '...' has already been declared` and the whole script stops.

## Complete Code with Brief Line-by-Line Explanation

```js
let cachedBooks = [];

async function refreshBookCache() {
  try {
    cachedBooks = await apiFetch("/books");
  } catch {
    cachedBooks = [];
  }
}
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
let cachedBooks = [];                                                   // Stores latest books from API

async function refreshBookCache() {                                     // Function updates book cache
  try {                                                                 // Start error handling block
    cachedBooks = await apiFetch("/books");                             // Load books from API into cache
  } catch {                                                             // Run if API call fails
    cachedBooks = [];                                                   // Use empty array to avoid errors
  }
}
```

## Explanation

The frontend uses `cachedBooks` to:

- Show book titles in Borrow History
- Fill the Borrow Book dropdown
- Fill the Return Book dropdown

---

# Part 11 — Populate Borrow Book Dropdown

## Complete Code with Brief Line-by-Line Explanation

```js
async function populateBorrowBookDropdown() {
  const select = document.getElementById("borrow-bookselect");
  if (!select) return;

  try {
    await refreshBookCache();

    const available = cachedBooks.filter(b => b.isAvailable);

    select.innerHTML = available.length === 0
      ? '<option value="">— No books available —</option>'
      : '<option value="">— Select a book —</option>';

    available.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = `${b.title} (${b.author})`;
      select.appendChild(opt);
    });
  } catch {
    select.innerHTML = '<option value="">— Error loading books —</option>';
  }
}
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
async function populateBorrowBookDropdown() {                           // Function fills Borrow Book dropdown
  const select = document.getElementById("borrow-bookselect");          // Select the dropdown
  if (!select) return;                                                  // Stop if dropdown does not exist

  try {                                                                 // Start error handling block
    await refreshBookCache();                                           // Load latest books into cache

    const available = cachedBooks.filter(b => b.isAvailable);           // Keep only available books

    select.innerHTML = available.length === 0                           // Check if no books are available
      ? '<option value="">— No books available —</option>'              // Message when no books available
      : '<option value="">— Select a book —</option>';                 // Default option

    available.forEach(b => {                                            // Loop through available books
      const opt = document.createElement("option");                     // Create dropdown option
      opt.value = b.id;                                                 // Store book ID as option value
      opt.textContent = `${b.title} (${b.author})`;                     // Show book title and author
      select.appendChild(opt);                                          // Add option to dropdown
    });
  } catch {                                                             // Run if API call fails
    select.innerHTML = '<option value="">— Error loading books —</option>'; // Show error option
  }
}
```

## Explanation

The user sees:

```txt
Clean Code (Robert C. Martin)
```

But JavaScript reads:

```js
select.value // Example: "1"
```

That value becomes the `bookId`.

---

# Part 12 — Populate Return Book Dropdown

> `let cachedUnreturnedBorrows` is already declared in the template. Do not declare it again; paste only the function.

## Complete Code with Brief Line-by-Line Explanation

```js
async function populateReturnDropdown() {
  const select = document.getElementById("return-bookselect");
  if (!select) return;

  try {
    if (!cachedBooks.length) await refreshBookCache();
    if (!cachedMembers.length) await refreshMemberCache();

    const records = await apiFetch("/borrows");
    const unreturned = records.filter(r => !r.isReturned);
    cachedUnreturnedBorrows = unreturned;

    select.innerHTML = unreturned.length === 0
      ? '<option value="">— No books currently borrowed —</option>'
      : '<option value="">— Select a book to return —</option>';

    unreturned.forEach(r => {
      const book = cachedBooks.find(b => b.id === r.bookId);
      const member = cachedMembers.find(m => m.id === r.memberId);

      const title = book ? book.title : `Book #${r.bookId}`;
      const name = member ? member.name : `Member #${r.memberId}`;

      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = `${title} ← ${name}`;
      select.appendChild(opt);
    });
  } catch {
    select.innerHTML = '<option value="">— Error loading borrowed books —</option>';
  }
}
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
async function populateReturnDropdown() {                               // Function fills Return Book dropdown
  const select = document.getElementById("return-bookselect");          // Select return dropdown
  if (!select) return;                                                  // Stop if dropdown does not exist

  try {                                                                 // Start error handling block
    if (!cachedBooks.length) await refreshBookCache();                  // Load books if cache is empty
    if (!cachedMembers.length) await refreshMemberCache();              // Load members if cache is empty

    const records = await apiFetch("/borrows");                         // Load all borrow records
    const unreturned = records.filter(r => !r.isReturned);              // Keep records not yet returned
    cachedUnreturnedBorrows = unreturned;                               // Save for RFID return verification

    select.innerHTML = unreturned.length === 0                          // Check if there are no borrowed books
      ? '<option value="">— No books currently borrowed —</option>'    // Message when none borrowed
      : '<option value="">— Select a book to return —</option>';       // Default option

    unreturned.forEach(r => {                                           // Loop through borrowed records
      const book = cachedBooks.find(b => b.id === r.bookId);            // Find matching book by bookId
      const member = cachedMembers.find(m => m.id === r.memberId);      // Find borrower by memberId

      const title = book ? book.title : `Book #${r.bookId}`;            // Use title or fallback text
      const name = member ? member.name : `Member #${r.memberId}`;      // Use member name or fallback text

      const opt = document.createElement("option");                     // Create dropdown option
      opt.value = r.id;                                                 // Store borrow record ID as value
      opt.textContent = `${title} ← ${name}`;                           // Show book title and borrower name
      select.appendChild(opt);                                          // Add option to dropdown
    });
  } catch {                                                             // Run if API call fails
    select.innerHTML = '<option value="">— Error loading borrowed books —</option>'; // Show error option
  }
}
```

## Explanation

The dropdown displays:

```txt
Clean Code ← Alice Johnson
```

But its value is the borrow record ID:

```txt
5
```

That is needed for:

```txt
PUT /api/borrows/5/return
```

---

# Part 13 — Borrow a Book

## Endpoint

```txt
POST /api/borrows
```

## Complete Code with Brief Line-by-Line Explanation

```js
document.getElementById("form-borrow").addEventListener("submit", async e => {
  e.preventDefault();

  const bookId = parseInt(document.getElementById("borrow-bookselect").value);
  const memberId = parseInt(document.getElementById("borrow-memberid").value);

  if (!memberId) {
    showToast("Please tap an RFID card first.", "error");
    return;
  }

  try {
    await apiFetch("/borrows", {
      method: "POST",
      body: { bookId, memberId }
    });

    showToast("Book borrowed successfully!");
    e.target.reset();
    rfid.reset();
    loadBorrows();
    loadBooks();
    populateBorrowBookDropdown();
    populateReturnDropdown();
  } catch (err) {
    showToast(err.message, "error");
  }
});
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
document.getElementById("form-borrow").addEventListener("submit", async e => { // Listen for Borrow form submit
  e.preventDefault();                                                   // Stop page reload

  const bookId = parseInt(document.getElementById("borrow-bookselect").value); // Read selected book ID
  const memberId = parseInt(document.getElementById("borrow-memberid").value); // Read RFID-resolved member ID

  if (!memberId) {                                                       // Check if RFID was not scanned
    showToast("Please tap an RFID card first.", "error");               // Show warning
    return;                                                             // Stop function
  }

  try {                                                                 // Start error handling block
    await apiFetch("/borrows", {                                        // Call POST /api/borrows
      method: "POST",                                                  // Use POST to create borrow record
      body: { bookId, memberId }                                        // Send selected book and member
    });

    showToast("Book borrowed successfully!");                          // Show success message
    e.target.reset();                                                   // Clear borrow form
    rfid.reset();                                                       // Reset borrow RFID widget
    loadBorrows();                                                      // Reload borrow history
    loadBooks();                                                        // Reload books table
    populateBorrowBookDropdown();                                       // Remove borrowed book from dropdown
    populateReturnDropdown();                                           // Add borrowed book to return dropdown
  } catch (err) {                                                        // Run if API call fails
    showToast(err.message, "error");                                    // Show error message
  }
});
```

## Explanation

The request body sent to the API is:

```js
{
  bookId: 1,
  memberId: 2
}
```

---

# Part 14 — Return a Book

## Endpoint

```txt
PUT /api/borrows/{id}/return
```

## Complete Code with Brief Line-by-Line Explanation

```js
document.getElementById("form-return").addEventListener("submit", async e => {
  e.preventDefault();

  const recordId = document.getElementById("return-bookselect").value;

  if (!recordId) {
    showToast("Please select a book to return.", "error");
    return;
  }

  try {
    await apiFetch(`/borrows/${recordId}/return`, {
      method: "PUT"
    });

    showToast("Book returned successfully!");
    e.target.reset();
    returnRfid.reset();
    loadBorrows();
    loadBooks();
    populateBorrowBookDropdown();
    populateReturnDropdown();
  } catch (err) {
    showToast(err.message, "error");
  }
});
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
document.getElementById("form-return").addEventListener("submit", async e => { // Listen for Return form submit
  e.preventDefault();                                                   // Stop page reload

  const recordId = document.getElementById("return-bookselect").value;  // Read selected borrow record ID

  if (!recordId) {                                                       // Check if no book was selected
    showToast("Please select a book to return.", "error");              // Show warning
    return;                                                             // Stop function
  }

  try {                                                                 // Start error handling block
    await apiFetch(`/borrows/${recordId}/return`, {                     // Call PUT /api/borrows/{id}/return
      method: "PUT"                                                     // Use PUT to update borrow record
    });

    showToast("Book returned successfully!");                           // Show success message
    e.target.reset();                                                   // Clear return form
    returnRfid.reset();                                                 // Reset return RFID widget
    loadBorrows();                                                      // Reload borrow history
    loadBooks();                                                        // Reload books table
    populateBorrowBookDropdown();                                       // Add returned book back to borrow dropdown
    populateReturnDropdown();                                           // Remove returned book from return dropdown
  } catch (err) {                                                        // Run if API call fails
    showToast(err.message, "error");                                    // Show error message
  }
});
```

## Explanation

The return RFID widget verifies the borrower first. The Return button is enabled only after RFID matches the original borrower.

---

# Part 15 — Load Borrow History Table

## Endpoint

```txt
GET /api/borrows
```

## Complete Code with Brief Line-by-Line Explanation

```js
async function loadBorrows() {
  try {
    const records = await apiFetch("/borrows");
    const tbody = document.querySelector("#table-borrows tbody");
    tbody.innerHTML = "";

    records.forEach(r => {
      const book = cachedBooks.find(b => b.id === r.bookId);
      const member = cachedMembers.find(m => m.id === r.memberId);

      const bookTitle = book ? book.title : `Book #${r.bookId}`;
      const memberName = member ? member.name : `Member #${r.memberId}`;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.id}</td>
        <td>${bookTitle}</td>
        <td>${memberName}</td>
        <td>${new Date(r.borrowDate).toLocaleDateString()}</td>
        <td>${r.returnDate ? new Date(r.returnDate).toLocaleDateString() : "—"}</td>
        <td><span class="badge ${r.isReturned ? "badge-green" : "badge-red"}">
              ${r.isReturned ? "Yes" : "No"}
            </span></td>
      `;

      tbody.appendChild(row);
    });
  } catch (err) {
    showToast("Could not load borrow records: " + err.message, "error");
  }
}
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
async function loadBorrows() {                                          // Function loads borrow history
  try {                                                                 // Start error handling block
    const records = await apiFetch("/borrows");                         // Call GET /api/borrows
    const tbody = document.querySelector("#table-borrows tbody");       // Select borrow table body
    tbody.innerHTML = "";                                               // Clear old rows

    records.forEach(r => {                                              // Loop through borrow records
      const book = cachedBooks.find(b => b.id === r.bookId);            // Find matching book
      const member = cachedMembers.find(m => m.id === r.memberId);      // Find matching member

      const bookTitle = book ? book.title : `Book #${r.bookId}`;        // Show title or fallback
      const memberName = member ? member.name : `Member #${r.memberId}`; // Show name or fallback

      const row = document.createElement("tr");                         // Create table row
      row.innerHTML = `
        <td>${r.id}</td>                                                <!-- Borrow record ID -->
        <td>${bookTitle}</td>                                           <!-- Book title -->
        <td>${memberName}</td>                                          <!-- Borrower name -->
        <td>${new Date(r.borrowDate).toLocaleDateString()}</td>         <!-- Borrow date -->
        <td>${r.returnDate ? new Date(r.returnDate).toLocaleDateString() : "—"}</td> <!-- Return date -->
        <td><span class="badge ${r.isReturned ? "badge-green" : "badge-red"}">
              ${r.isReturned ? "Yes" : "No"}                           <!-- Returned status -->
            </span></td>
      `;

      tbody.appendChild(row);                                           // Add row to table
    });
  } catch (err) {                                                        // Run if API call fails
    showToast("Could not load borrow records: " + err.message, "error"); // Show error message
  }
}
```

## Explanation

The API gives IDs:

```js
bookId
memberId
```

The frontend converts them into readable names using:

```js
cachedBooks
cachedMembers
```

---

# Part 16 — Initial Page Load

## Complete Code with Brief Line-by-Line Explanation

```js
loadBooks();
refreshBookCache();

loadMembers().then(() => {
  refreshMemberCache().then(async () => {
    await refreshBookCache();
    rfid = initRFID();
    regRfid = initRegRFID();
    returnRfid = initReturnRFID();
    populateBorrowBookDropdown();
    populateReturnDropdown();
    loadBorrows();
  });
});
```

**Line-by-line explanation (commented version, for reading only — do not copy):**

```js
loadBooks();                                                           // Load books table when page opens
refreshBookCache();                                                    // Start filling the book cache

loadMembers().then(() => {                                             // Load members first, then continue
  refreshMemberCache().then(async () => {                              // Fill RFID member cache
    await refreshBookCache();                                          // Make sure books are cached too
    rfid = initRFID();                                                 // Start Borrow RFID widget
    regRfid = initRegRFID();                                           // Start Registration RFID widget
    returnRfid = initReturnRFID();                                     // Start Return RFID widget
    populateBorrowBookDropdown();                                      // Fill Borrow Book dropdown
    populateReturnDropdown();                                          // Fill Return Book dropdown
    loadBorrows();                                                     // Load history AFTER caches so names show
  });
});
```

## Explanation

This runs automatically when the page opens.

The order matters. `loadBorrows()` must run **after** the book and member caches are filled. If it runs first, the history table shows `Book #1` and `Member #2` instead of real names.

---

# Full Implementation Checklist

Students must complete these sections in `FrontEnd/app.js`:

```txt
[ ] loadBooks()
[ ] deleteBook(id)
[ ] Add Book form submit
[ ] loadMembers()
[ ] deleteMember(id)
[ ] Add Member form submit
[ ] saveRfid()
[x] refreshMemberCache()   (already provided)
[x] findMemberByRFID()     (already provided)
[x] refreshBookCache()     (already provided)
[ ] populateBorrowBookDropdown()
[ ] populateReturnDropdown()
[ ] Borrow form submit
[ ] Return form submit
[ ] loadBorrows()
[ ] Initial page load calls
```

---

# Testing Steps

## 1. Start the API

```bash
cd API
dotnet run
```

Note the `Now listening on: http://localhost:XXXX` line. The port must match `API_BASE` in `app.js`. Confirm by opening `http://localhost:XXXX/api/books` in the browser (you should see JSON). Keep this terminal open while testing.

## 2. Open the FrontEnd

Open:

```txt
FrontEnd/index.html
```

Press `F12` and watch the **Console** tab. Any red error there tells you what is wrong.

## 3. Test Books

```txt
1. Books should load in the table.
2. Add Book should create a new book.
3. Delete Book should remove a book.
4. Borrow dropdown should show available book titles.
```

## 4. Test Members

```txt
1. Members should load in the table.
2. Add Member should create a member.
3. RFID value should save correctly.
4. Set RFID should update an existing member.
5. Delete Member should remove a member.
```

## 5. Test Borrowing

```txt
1. Select a book title from the dropdown.
2. Tap a registered RFID card.
3. Borrow button should enable.
4. Click Borrow.
5. Borrow History should show the new record.
```

## 6. Test Returning

```txt
1. Select a borrowed book from the Return dropdown.
2. Tap the RFID card of the original borrower.
3. Return button should enable.
4. Click Return.
5. The book should become available again.
```

---

# Common Errors and Fixes

## Error: `dotnet` is not recognized

The .NET SDK is not installed, or the terminal was not reopened after installing.

Fix: see **Prerequisites → Install .NET SDK**, then reopen the terminal.

---

## Error: `ERR_CONNECTION_REFUSED`

The API is not running, or `API_BASE` uses the wrong port.

Fix: run `dotnet run`, read the `Now listening on` line, and update `API_BASE`.

---

## Error: `blocked by CORS policy`

The API does not allow requests from the browser page.

Fix: see **Prerequisites → CORS**. This is an API setting, not a frontend bug.

---

## Error: `Identifier '...' has already been declared`

A provided helper (`cachedMembers`, `cachedBooks`, `cachedUnreturnedBorrows`, `refreshMemberCache`, and so on) was pasted a second time.

Fix: delete the duplicate. Only fill in the TODO sections.

---

## Error: `input is not defined` or `member is not defined`

`saveRfid()` was pasted outside `openInlineRfidEditor()`.

Fix: keep it inside that function (see Part 7).

---

## Table shows `Book #1` / `Member #2` instead of names

`loadBorrows()` ran before the caches were filled.

Fix: use the Part 16 order (call `loadBorrows()` last).

---

## Error: `Failed to fetch`

The API is not running.

Fix:

```bash
cd API
dotnet run
```

---

## Error: `404 Not Found`

The endpoint path is wrong.

Correct:

```js
apiFetch("/books")
```

Wrong:

```js
apiFetch("/api/books")
```

Because `API_BASE` already includes `/api`.

---

## RFID not recognized

Check:

```txt
1. The member has an RFID value.
2. The RFID value is saved in rfidValue.
3. The page was refreshed after registration.
4. The API is running.
```

---

# Student Reflection Questions

1. What does `apiFetch()` do?
2. Why do we use `try/catch` around API calls?
3. What is the difference between `POST` and `PUT`?
4. Why does RFID matching use `rfidValue` instead of `studentId`?
5. Why do we refresh tables after adding, deleting, borrowing, or returning?
6. Why does the Return dropdown use borrow record ID instead of book ID?

---

# Final Data Flow

```txt
HTML Form / Button
        ↓
JavaScript Event Listener
        ↓
apiFetch()
        ↓
.NET API Controller
        ↓
In-memory Data List
        ↓
JSON Response
        ↓
JavaScript updates the page
```