# Activity Sheet with Code: Connect the Library Frontend to the API

## Activity Title
**Library Borrowing System — API to Frontend Implementation**

## Objective
Students will write the whole of `app.js` in the **LibraryBorrowingFrontEnd** repository so that the HTML frontend works with the .NET Web API from the **LibraryBorrowingAPI** repository.

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

# READ THIS FIRST — How `app.js` Works in This Activity

**`app.js` starts empty.** It contains only a comment:

```js
// ============================================================
// PLACE CODE HERE, PLEASE DELETE THIS COMMENT
// ============================================================
```

Nothing is provided for you. There is **no** `rfid.js`, and no helper code is hidden in `index.html`. Everything the page needs goes into `app.js`: the API helper, the toast message, the caches, the tabs, the RFID scanners and every table, form and dropdown.

Follow these rules.

1. **Delete the `PLACE CODE HERE` comment**, then paste the parts **in order**, Part 1 to Part 18, into one `app.js`.
2. **Paste each part exactly once.** A repeated `let` gives `Identifier '...' has already been declared`. A repeated event listener sends two requests for one click.
3. **Do not skip a part.** Skipping Part 4 leaves the tabs dead. Skipping Part 12 breaks every RFID box. Skipping Part 16 leaves the Return button doing nothing.
4. **Keep the order.** The `let` variables (Part 1) must come before any code that uses them. The page-load code (Part 18) must be last.
5. **`saveRfid()` lives inside `openInlineRfidEditor()`** (Part 11). It is not a top-level function.
6. **Take screenshots as you go.** Each part ends with a "📸 Screenshot" line. You paste them into **one Word or Google Doc**. Set up your folder and document (see **Screenshot Evidence — Setup**) **before Part 1**, after you have cloned both projects.
7. **Remove the `rfid.js` script tag from `index.html`** if it is there:

```html
<script src="rfid.js"></script>   <!-- DELETE this line: the file does not exist -->
<script src="app.js"></script>
```

## Paste Map

| Part | What it is | Where it goes in `app.js` |
|---|---|---|
| 1 | `API_BASE`, shared variables, `apiFetch()` | Very top |
| 2 | `showToast()` | After Part 1 |
| 3 | Caches and `findMemberByRFID()` | After Part 2 |
| 4 | Tab buttons and Refresh buttons | After Part 3 |
| 5 | `loadBooks()` | After Part 4 |
| 6 | `deleteBook(id)` | After Part 5 |
| 7 | Add Book listener | After Part 6 (**once only**) |
| 8 | `loadMembers()` | After Part 7 |
| 9 | `deleteMember(id)` | After Part 8 |
| 10 | Add Member listener | After Part 9 |
| 11 | `openInlineRfidEditor()` with `saveRfid()` inside | After Part 10 |
| 12 | RFID widgets: `createRfidWidget`, `initRFID`, `initRegRFID`, `initReturnRFID` | After Part 11 |
| 13 | `populateBorrowBookDropdown()` | After Part 12 |
| 14 | `populateReturnDropdown()` | After Part 13 |
| 15 | Borrow listener | After Part 14 (**once only**) |
| 16 | Return listener | After Part 15 (**do not skip**) |
| 17 | `loadBorrows()` | After Part 16 |
| 18 | Initial page load | **Last** |

---

# How to Copy the Code

Each code section has a **clean code block** first and an explanation after it.

1. **Clean code block.** Use its **Copy** button. It has no comments, so it is safe to paste into `app.js`.
2. **Explanation.** Read it to learn. Where it is a commented copy of the code, do not copy from it.

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

Also match the SDK to the API project. Open `LibraryAPI.csproj` in the `LibraryBorrowingAPI` folder and look for:

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
cd LibraryBorrowingAPI
dotnet run
```

Look for a line like:

```txt
Now listening on: http://localhost:5000
```

If the port is different (for example `5123`), change `API_BASE` in `app.js` (Part 1) to match the port printed by `dotnet run`:

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

# Get the Two Projects from GitHub

The activity uses **two repositories** in the `CCIT102-2A` organization:

| Repository | What it is | What you do with it |
|---|---|---|
| `CCIT102-2A/LibraryBorrowingAPI` | The .NET Web API | **Clone and run it.** Do not edit it. |
| `CCIT102-2A/LibraryBorrowingFrontEnd` | The HTML page and `app.js` | **Fork it, clone your fork, and write `app.js`.** You also submit your screenshot document here by pull request. |

## 1. Clone the API (no fork needed)

```bash
cd C:\Users\<you>\Documents
git clone https://github.com/CCIT102-2A/LibraryBorrowingAPI.git
```

## 2. Fork the FrontEnd, then clone your fork

1. Open https://github.com/CCIT102-2A/LibraryBorrowingFrontEnd and click **Fork**. Choose **your own GitHub account** as the owner.
2. Clone **your fork** (use your GitHub username):

```bash
cd C:\Users\<you>\Documents
git clone https://github.com/<your-username>/LibraryBorrowingFrontEnd.git
```

3. Link the original repository so you can get updates later:

```bash
cd LibraryBorrowingFrontEnd
git remote add upstream https://github.com/CCIT102-2A/LibraryBorrowingFrontEnd.git
```

To check: `git remote -v` must show `origin` (your fork) and `upstream` (CCIT102-2A).

You now have two sibling folders:

```txt
Documents/
  LibraryBorrowingAPI/          <- run this with `dotnet run`, do not edit
    Controllers/  Models/  Program.cs  LibraryAPI.csproj  appsettings.json
  LibraryBorrowingFrontEnd/     <- you work here
    app.js          <- the only code file you edit
    index.html      <- already built (only delete the rfid.js script tag if present)
    style.css       <- already built
    Screenshots/    <- you add your own folder here (see Screenshot Evidence)
```

Open **`LibraryBorrowingFrontEnd`** in VS Code. Run the API from **`LibraryBorrowingAPI`**.

**Tip:** Save your work often. If `app.js` breaks, undo with `Ctrl+Z` rather than starting over.

Do not edit the API code during this activity. Your task is to connect the existing HTML page to the running API.

---

# What the HTML Page Expects

`app.js` finds elements by `id`, so the names must match `index.html`. The important ones:

| Area | Ids used by `app.js` |
|---|---|
| Tabs | `.tab-btn` buttons with `data-tab`, and panels `#tab-books`, `#tab-members`, `#tab-borrowing` |
| Refresh | `btn-refresh-books`, `btn-refresh-members`, `btn-refresh-borrows` |
| Books | `form-add-book`, `book-title`, `book-author`, `book-isbn`, `table-books` |
| Members | `form-add-member`, `member-name`, `member-studentid`, `member-email`, `member-rfidvalue`, `table-members` |
| Borrow | `form-borrow`, `borrow-bookselect`, `borrow-memberid`, `btn-borrow` |
| Return | `form-return`, `return-bookselect`, `btn-return` |
| History | `table-borrows` |
| Toast | `toast` |
| RFID boxes | `rfid-…`, `reg-rfid-…`, `return-rfid-…` (each with `tap-zone`, `tap-text`, `scan-input`, `result`, `clear-btn`) |

---

# Screenshot Evidence — Setup (do this before Part 1)

This is an activity, so you prove your work with screenshots. You will paste about 40 of them into **one document** (Microsoft Word or Google Docs), in three groups:

| Group | What it proves | Caption names |
|---|---|---|
| **Setup** | The API is running | `setup-01...`, `setup-02...` |
| **Code** | You wrote each part (one screenshot per part, taken right after you finish it) | `part-01...` to `part-18...` |
| **Early checks and Tests** | The page works (browser screenshots) | `early-01...`, `test-01...` to `test-14...` |

**You submit that one document only. Never submit `app.js`, `index.html`, the API, or any other project file.**

## A. Create your folder (once)

Inside your `LibraryBorrowingFrontEnd` folder, the `Screenshots/` folder holds one folder per student. If `Screenshots/` does not exist yet, create it. Then create **your** folder inside it and name it with your student ID and your name, no spaces:

```txt
LibraryBorrowingFrontEnd/
  Screenshots/
    S2013101834_JohnEubertManalo/
      S2013101834_JohnEubertManalo.docx
    S2020000000_JohnGilbertSeñido/
      S2020000000_JohnGilbertSeñido.docx
```

The document has the **same name as your folder**, with `.docx` at the end. Use only your own folder. Never open or change another student's folder.

## B. Create your document

1. Open **Microsoft Word** or **Google Docs**.
2. On the first page write your full name, student ID and the date.
3. Add a heading for each screenshot (the caption name from the sheet, for example `part-05-loadbooks`), and paste the screenshot directly under it.
4. Save it as `S<ID>_<Name>.docx` inside your folder:
   - **Word:** `File → Save As` and choose your folder.
   - **Google Docs:** `File → Download → Microsoft Word (.docx)`, then move the downloaded file into your folder and rename it to match the folder name.

Build the document as you go, not at the end. If you use Google Docs, download the final `.docx` again every time you add more screenshots.

## C. How to take a screenshot

- **Windows:** press `Win + Shift + S`, drag over the area, then press `Ctrl + V` in your document. **Mac:** `Cmd + Shift + 4`.
- Do not use phone photos of the screen.
- Make each picture about 16 cm wide so the text is readable.

## D. Rules for every screenshot

| Type | It must show |
|---|---|
| **Code** | The `app.js` editor tab name, line numbers, and the **whole** function or block (not half). If it does not fit, take two screenshots and add `a` / `b` to the caption. |
| **Browser** | The page, the address bar, and the **Console** open (`F12`) with **no red errors**. If there are red errors, fix them first. |

## E. Setup screenshots (take them now)

1. **`setup-01-api-running`**: the terminal showing `Now listening on: http://localhost:XXXX` after `dotnet run`.
2. **`setup-02-api-books-json`**: the browser at `http://localhost:XXXX/api/books` showing JSON.

---

# Part 1 — Settings, Shared Variables and `apiFetch()`

## Complete Code

```js
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
```

**`apiFetch()` line-by-line explanation (commented version, for reading only — do not copy):**

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

## Explanation

- `API_BASE` already includes `/api`, so write `apiFetch("/books")`, never `apiFetch("/api/books")`.
- `cachedMembers`, `cachedBooks` and `cachedUnreturnedBorrows` hold the latest data from the API so the RFID and dropdown code can look things up without a new request each time.
- `rfid`, `regRfid` and `returnRfid` will hold the three RFID widgets. They are filled in Part 18.
- `apiFetch()` prevents repeated code. Instead of a long `fetch()` call every time, you write `apiFetch("/books")`.

## Where to paste
At the very top of `app.js`, after deleting the `PLACE CODE HERE` comment.

## 📸 Screenshot (code), caption: `part-01-settings-apifetch`
Take a screenshot of the top of `app.js`: `API_BASE`, the `let` variables and the whole `apiFetch()` function. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 2 — Toast Messages

## Complete Code

```js
let toastTimer;

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type}`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 3000);
}
```

## Explanation

`showToast("Book added!")` shows a small green message. `showToast("Something failed", "error")` shows an error. The message hides itself after 3 seconds. It writes into the `<div id="toast">` already in `index.html`.

Every `catch` block in this activity calls `showToast()`, so it must exist before anything else runs.

## Where to paste
Directly after Part 1.

## 📸 Screenshot (code), caption: `part-02-showtoast`
Take a screenshot of the whole `showToast()` function. Follow the screenshot rules in **Screenshot Evidence — Setup**.

**Quick check (caption `early-01-toast`).** Open `index.html`, press `F12`, and in the **Console** type `showToast("Hello")` and press Enter. Take a screenshot showing the toast message **and** the open Console.

---

# Part 3 — Caches and Find Member by RFID

## Complete Code

```js
async function refreshMemberCache() {
  try {
    cachedMembers = await apiFetch("/members");
  } catch {
    cachedMembers = [];
  }
}

async function refreshBookCache() {
  try {
    cachedBooks = await apiFetch("/books");
  } catch {
    cachedBooks = [];
  }
}

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
async function refreshMemberCache() {                                   // Function updates member cache
  try {                                                                 // Start error handling block
    cachedMembers = await apiFetch("/members");                         // Load members from API into cache
  } catch {                                                             // Run if API call fails
    cachedMembers = [];                                                 // Use empty array to avoid errors
  }
}

async function refreshBookCache() {                                     // Function updates book cache
  try {                                                                 // Start error handling block
    cachedBooks = await apiFetch("/books");                             // Load books from API into cache
  } catch {                                                             // Run if API call fails
    cachedBooks = [];                                                   // Use empty array to avoid errors
  }
}

function findMemberByRFID(scannedValue) {                               // Function receives scanned RFID value
  const trimmed = scannedValue.trim();                                  // Remove extra spaces

  return cachedMembers.find(                                            // Search members array
    m => m.rfidValue &&                                                 // Make sure member has RFID value
         m.rfidValue.toLowerCase() === trimmed.toLowerCase()            // Compare RFID values case-insensitively
  ) || null;                                                            // Return found member or null
}
```

## Explanation

- The RFID scanner uses `cachedMembers` to find the member with the matching `rfidValue`.
- The frontend uses `cachedBooks` to show book titles in Borrow History and to fill the Borrow and Return dropdowns.
- RFID matching must use `m.rfidValue`. Do not match against `m.studentId` or `m.id`.

## Where to paste
After Part 2. The `let cachedMembers` and `let cachedBooks` lines are already in Part 1, so do not declare them again.

## 📸 Screenshot (code), caption: `part-03-caches`
Take a screenshot of `refreshMemberCache()`, `refreshBookCache()` and `findMemberByRFID()`. Follow the screenshot rules in **Screenshot Evidence — Setup**.

**Quick check (caption `early-02-cache-console`).** With the API running, open `index.html`, press `F12`, and in the **Console** run:

```js
await refreshBookCache(); cachedBooks
```

Take a screenshot showing the list of books printed in the Console.

---

# Part 4 — Tabs and Refresh Buttons

## Complete Code

```js
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

document.getElementById("btn-refresh-books").addEventListener("click", () => {
  loadBooks();
  populateBorrowBookDropdown();
});

document.getElementById("btn-refresh-members").addEventListener("click", async () => {
  await loadMembers();
  await refreshMemberCache();
});

document.getElementById("btn-refresh-borrows").addEventListener("click", async () => {
  await refreshBookCache();
  await refreshMemberCache();
  loadBorrows();
  populateReturnDropdown();
});
```

## Explanation

- Each tab button has `data-tab="books"` (or `members`, `borrowing`). The matching panel has `id="tab-books"` and so on.
- On click, the code removes `active` from every button and panel, then adds `active` to the clicked button and its panel.
- Without this part, the tabs look like buttons but do nothing.
- The Refresh buttons reload the table next to them.

## Where to paste
After Part 3.

## 📸 Screenshot (code), caption: `part-04-tabs-refresh`
Take a screenshot of the tab-button code and the three Refresh-button listeners. Follow the screenshot rules in **Screenshot Evidence — Setup**.

**Quick check (caption `early-03-tabs`).** Open `index.html` and click the **Members** tab. Take a screenshot showing the Members panel visible and the **Members** button highlighted.

---

# Part 5 — Load Books into Table

## Endpoint

```txt
GET /api/books
```

## Complete Code

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

## Where to paste
After Part 4.

## 📸 Screenshot (code), caption: `part-05-loadbooks`
Take a screenshot of the whole `loadBooks()` function. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 6 — Delete Book

## Endpoint

```txt
DELETE /api/books/{id}
```

## Complete Code

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

## Where to paste
After Part 5.

## 📸 Screenshot (code), caption: `part-06-deletebook`
Take a screenshot of the whole `deleteBook()` function. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 7 — Add Book

## Endpoint

```txt
POST /api/books
```

## Complete Code

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

## Where to paste
After Part 6. **Paste it once only.** If `form-add-book` appears twice in `app.js`, every click adds the book twice.

## 📸 Screenshot (code), caption: `part-07-addbook`
Take a screenshot of the whole Add Book listener. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 8 — Load Members into Table

## Endpoint

```txt
GET /api/members
```

## Complete Code

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

## Where to paste
After Part 7.

## 📸 Screenshot (code), caption: `part-08-loadmembers`
Take a screenshot of the whole `loadMembers()` function (scroll if needed; take 2 screenshots, `part-08a` and `part-08b`). Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 9 — Delete Member

## Endpoint

```txt
DELETE /api/members/{id}
```

## Complete Code

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

## Where to paste
After Part 8.

## 📸 Screenshot (code), caption: `part-09-deletemember`
Take a screenshot of the whole `deleteMember()` function. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 10 — Add Member with RFID Value

## Endpoint

```txt
POST /api/members
```

## Complete Code

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

## Where to paste
After Part 9.

## 📸 Screenshot (code), caption: `part-10-addmember`
Take a screenshot of the whole Add Member listener. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 11 — Inline RFID Editor and Update Member RFID

## Endpoint

```txt
PUT /api/members/{id}
```

## Complete Code

```js
// Inline editor shown in the RFID cell when "Set" is clicked.
// saveRfid() lives INSIDE this function because it needs `input` and `member`.
function openInlineRfidEditor(member, cell) {
  cell.innerHTML = `
    <input type="text" class="rfid-inline-input" placeholder="Scan or type RFID…" autocomplete="off" />
    <button type="button" class="btn-save-rfid">Save</button>
    <button type="button" class="btn-cancel-rfid">Cancel</button>
  `;

  const input = cell.querySelector(".rfid-inline-input");
  input.value = member.rfidValue || "";

  async function saveRfid() {
    const newRfid = input.value.trim();

    if (!newRfid) {
      showToast("Scan or type an RFID value first.", "error");
      return;
    }

    const owner = findMemberByRFID(newRfid);
    if (owner && owner.id !== member.id) {
      showToast(`That RFID already belongs to ${owner.name}.`, "error");
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

  cell.querySelector(".btn-save-rfid").addEventListener("click", saveRfid);
  cell.querySelector(".btn-cancel-rfid").addEventListener("click", loadMembers);

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); saveRfid(); }
    if (e.key === "Escape") loadMembers();
  });

  input.focus();
  input.select();
}
```

## Explanation

- Clicking **Set** in the Members table calls `openInlineRfidEditor(m, cell)` (see Part 8). It swaps the RFID cell for a text box with **Save** and **Cancel** buttons.
- `saveRfid()` is declared **inside** this function because it needs `input` and `member`. At the top level of the file those names do not exist, which causes `input is not defined`.
- `PUT` updates the whole member record, so the body must include every field:

```js
name       // Existing value
studentId  // Existing value
email      // Existing value
rfidValue  // New value
```

- Before saving, the code checks that no other member already has the same RFID.
- A scanner types the value and presses **Enter**, so Enter saves and **Esc** cancels.

## Where to paste
After Part 10, as one complete function.

## 📸 Screenshot (code), caption: `part-11-inline-rfid-editor`
Take a screenshot of the whole `openInlineRfidEditor()` function. `saveRfid()` must be visible **indented inside it**. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 12 — RFID Widgets (Borrow, Register, Return)

## Complete Code

```js
// Shared builder. `prefix` matches the element ids in index.html:
//   "rfid", "reg-rfid", "return-rfid"
function createRfidWidget(prefix, idleText, onScan, onReset) {
  const tapZone = document.getElementById(`${prefix}-tap-zone`);
  const tapText = document.getElementById(`${prefix}-tap-text`);
  const scanInput = document.getElementById(`${prefix}-scan-input`);
  const result = document.getElementById(`${prefix}-result`);
  const clearBtn = document.getElementById(`${prefix}-clear-btn`);

  const widget = {
    showResult(message, ok) {
      result.textContent = message;
      result.classList.remove("hidden");
      result.classList.toggle("rfid-ok", ok);
      result.classList.toggle("rfid-error", !ok);
    },
    setTapText(text) {
      tapText.textContent = text;
    },
    showClear() {
      clearBtn.classList.remove("hidden");
    },
    reset() {
      scanInput.value = "";
      result.textContent = "";
      result.classList.add("hidden");
      clearBtn.classList.add("hidden");
      tapText.textContent = idleText;
      onReset();
    }
  };

  tapZone.addEventListener("click", () => scanInput.focus());
  clearBtn.addEventListener("click", () => widget.reset());

  // RFID readers type the UID quickly and finish with Enter.
  scanInput.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();                       // do not submit the form
    const value = scanInput.value.trim();
    scanInput.value = "";
    if (value) onScan(value);
  });

  widget.reset();
  return widget;
}

// Borrow form: identify the member from the card
function initRFID() {
  const memberIdInput = document.getElementById("borrow-memberid");
  const borrowBtn = document.getElementById("btn-borrow");

  const widget = createRfidWidget(
    "rfid",
    "Tap Employee RFID Card",
    value => {
      const member = findMemberByRFID(value);

      if (!member) {
        memberIdInput.value = "";
        borrowBtn.disabled = true;
        widget.showResult(`RFID not recognized: ${value}`, false);
        return;
      }

      memberIdInput.value = member.id;
      borrowBtn.disabled = false;
      widget.setTapText("Card recognized");
      widget.showResult(`${member.name} (${member.studentId})`, true);
      widget.showClear();
    },
    () => {
      memberIdInput.value = "";
      borrowBtn.disabled = true;
    }
  );

  return widget;
}

// Add Member form: capture the card UID into the RFID value field
function initRegRFID() {
  const valueInput = document.getElementById("member-rfidvalue");

  const widget = createRfidWidget(
    "reg-rfid",
    "Tap RFID Card to Register",
    value => {
      const owner = findMemberByRFID(value);

      if (owner) {
        widget.showResult(`Already registered to ${owner.name}.`, false);
        return;
      }

      valueInput.value = value;
      widget.setTapText("Card captured");
      widget.showResult(`RFID captured: ${value}`, true);
      widget.showClear();
    },
    () => {
      valueInput.value = "";
    }
  );

  return widget;
}

// Return form: the card must belong to the original borrower
function initReturnRFID() {
  const select = document.getElementById("return-bookselect");
  const returnBtn = document.getElementById("btn-return");

  const widget = createRfidWidget(
    "return-rfid",
    "Tap Borrower's RFID Card",
    value => {
      const recordId = select.value;

      if (!recordId) {
        widget.showResult("Select a book to return first.", false);
        return;
      }

      const member = findMemberByRFID(value);
      const record = cachedUnreturnedBorrows.find(r => String(r.id) === recordId);

      if (!member) {
        returnBtn.disabled = true;
        widget.showResult(`RFID not recognized: ${value}`, false);
        return;
      }

      if (!record || record.memberId !== member.id) {
        returnBtn.disabled = true;
        widget.showResult("This card does not belong to the borrower of this book.", false);
        return;
      }

      returnBtn.disabled = false;
      widget.setTapText("Borrower verified");
      widget.showResult(`Verified: ${member.name}`, true);
      widget.showClear();
    },
    () => {
      returnBtn.disabled = true;
    }
  );

  // Choosing a different book invalidates the earlier verification
  select.addEventListener("change", () => widget.reset());

  return widget;
}
```

## Explanation

The page has three RFID boxes. They share the same behavior, so `createRfidWidget()` builds one and the three `init...` functions customize it.

| Function | Box | What happens after a scan |
|---|---|---|
| `initRFID()` | Borrow tab, **Employee RFID** | Finds the member by `rfidValue`, stores the member id in `borrow-memberid`, enables **Borrow** |
| `initRegRFID()` | Members tab, **RFID Value** | Puts the scanned value into `member-rfidvalue`; rejects a card already registered to someone |
| `initReturnRFID()` | Borrow tab, **Borrower RFID** | Enables **Return** only if the card belongs to the original borrower of the selected book |

How scanning works:

- An RFID reader acts like a keyboard. It types the card number quickly and presses **Enter**.
- Click the tap zone first so the hidden scan field has focus.
- The Enter key is stopped with `e.preventDefault()` so the form is not submitted by accident.
- Each widget returns an object with `reset()`. The Borrow, Add Member and Return forms call it after a successful submit.

## Where to paste
After Part 11.

## 📸 Screenshot (code), caption: `part-12a-rfid-widget-builder`
Take a screenshot of the whole `createRfidWidget()` function. Then take `part-12b-rfid-init-functions` showing `initRFID()`, `initRegRFID()` and `initReturnRFID()`. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 13 — Populate Borrow Book Dropdown

## Complete Code

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

## Where to paste
After Part 12.

## 📸 Screenshot (code), caption: `part-13-borrow-dropdown`
Take a screenshot of the whole `populateBorrowBookDropdown()` function. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 14 — Populate Return Book Dropdown

## Complete Code

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

## Where to paste
After Part 13.

## 📸 Screenshot (code), caption: `part-14-return-dropdown`
Take a screenshot of the whole `populateReturnDropdown()` function. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 15 — Borrow a Book

## Endpoint

```txt
POST /api/borrows
```

## Complete Code

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

## Where to paste
After Part 14. **Paste it once only.** If `form-borrow` appears twice, one click sends two requests and the second shows an error even though the book was borrowed.

## 📸 Screenshot (code), caption: `part-15-borrow`
Take a screenshot of the whole Borrow listener. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 16 — Return a Book

## Endpoint

```txt
PUT /api/borrows/{id}/return
```

## Complete Code

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

## Where to paste
After Part 15. **Do not skip it.** Without `form-return`, the Return button does nothing and shows no error.

## 📸 Screenshot (code), caption: `part-16-return`
Take a screenshot of the whole Return listener. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 17 — Load Borrow History Table

## Endpoint

```txt
GET /api/borrows
```

## Complete Code

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

## Where to paste
After Part 16.

## 📸 Screenshot (code), caption: `part-17-loadborrows`
Take a screenshot of the whole `loadBorrows()` function. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Part 18 — Initial Page Load

## Complete Code

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

This runs automatically when the page opens. The order matters. `loadBorrows()` must run **after** the book and member caches are filled. If it runs first, the history table shows `Book #1` and `Member #2` instead of real names.

The three widgets are created here, after the member cache is ready, because scanning needs `cachedMembers`.

## Where to paste
At the **very bottom** of `app.js`. Nothing goes after it.

## 📸 Screenshot (code), caption: `part-18-page-load`
Take a screenshot of the page-load code at the very bottom of `app.js`. Follow the screenshot rules in **Screenshot Evidence — Setup**.

---

# Full Implementation Checklist

Students must write all of these in `app.js`, in this order:

```txt
[ ] Part 1  API_BASE, shared variables, apiFetch()
[ ] Part 2  showToast()
[ ] Part 3  refreshMemberCache(), refreshBookCache(), findMemberByRFID()
[ ] Part 4  Tab buttons and Refresh buttons
[ ] Part 5  loadBooks()
[ ] Part 6  deleteBook(id)
[ ] Part 7  Add Book form submit        (once only)
[ ] Part 8  loadMembers()
[ ] Part 9  deleteMember(id)
[ ] Part 10 Add Member form submit
[ ] Part 11 openInlineRfidEditor() with saveRfid() inside
[ ] Part 12 createRfidWidget(), initRFID(), initRegRFID(), initReturnRFID()
[ ] Part 13 populateBorrowBookDropdown()
[ ] Part 14 populateReturnDropdown()
[ ] Part 15 Borrow form submit          (once only)
[ ] Part 16 Return form submit          (do not skip)
[ ] Part 17 loadBorrows()
[ ] Part 18 Initial page load           (last)
[ ] Removed the rfid.js script tag from index.html
```

Nothing is "already provided". Every item above is written by the student.

---

# Final Self-Check Before Testing

Press `Ctrl+F` in `app.js` and confirm each count:

| Search for | Expected matches | If different |
|---|---|---|
| `PLACE CODE HERE` | 0 | Delete that comment |
| `const API_BASE` | 1, with the correct port | The port must match `dotnet run` |
| `let cachedMembers` | 1 | 2 or more: delete the duplicate |
| `let cachedBooks` | 1 | 2 or more: delete the duplicate |
| `let rfid, regRfid, returnRfid` | 1 | 0: add it (Part 1) |
| `function showToast` | 1 | 0: you skipped Part 2 |
| `".tab-btn"` | 1 | 0: you skipped Part 4 |
| `"form-add-book"` | 1 | 2 or more: delete the duplicate listener |
| `"form-borrow"` | 1 | 2 or more: delete the duplicate listener |
| `"form-return"` | 1 | 0: you skipped Part 16 |
| `function createRfidWidget` | 1 | 0: you skipped Part 12 |
| `function openInlineRfidEditor` | 1 | 0: you skipped Part 11 |
| `async function saveRfid` | 1, indented inside `openInlineRfidEditor` | At the left margin: move it inside |
| `<script src="rfid.js">` in `index.html` | 0 | Delete the line |

---

# Testing Steps

## 1. Start the API

```bash
cd LibraryBorrowingAPI
dotnet run
```

Note the `Now listening on: http://localhost:XXXX` line. The port must match `API_BASE` in `app.js`. Confirm by opening `http://localhost:XXXX/api/books` in the browser (you should see JSON). Keep this terminal open while testing.

## 2. Open the FrontEnd (the `LibraryBorrowingFrontEnd` folder)

Open:

```txt
LibraryBorrowingFrontEnd/index.html
```

Press `F12` and watch the **Console** tab. Any red error there tells you what is wrong.

📸 **`test-01-page-loaded`**: the Books tab with the table filled with books, and the Console open with no red errors.

## 3. Test the Tabs

```txt
1. Click Members. The Members panel should appear.
2. Click Borrowing. The Borrowing panel should appear.
3. Click Books. You should be back on the Books panel.
```

📸 The tabs were already captured in `early-03-tabs`. No new screenshot here.

## 4. Test Books

```txt
1. Books should load in the table.
2. Add Book should create ONE new book (not two).
3. Delete Book should remove a book.
4. Borrow dropdown should show available book titles.
```

📸 **`test-02-add-book`**: after adding a book, the new row in the table and the green "Book added!" toast (exactly one row added).
📸 **`test-03-delete-book`**: after deleting a book, the row gone and the "Book deleted." toast.

## 5. Test Members

```txt
1. Members should load in the table.
2. Click the "Tap RFID Card to Register" box, scan or type a value, press Enter.
3. Add Member should create a member with that RFID value.
4. Set RFID should open an inline box, then Save should update an existing member.
5. Delete Member should remove a member.
```

📸 **`test-04-members-loaded`**: the Members tab with the table filled.
📸 **`test-05-register-rfid`**: the Add Member form after scanning, showing "RFID captured" and the value in the RFID field.
📸 **`test-06-add-member`**: the new member's row with its RFID tag and the "Member added!" toast.
📸 **`test-07-set-rfid-saved`**: a member's row after **Set** then **Save**, showing the new RFID tag and the "RFID set for ..." toast.
📸 **`test-08-delete-member`**: after deleting a member, the row gone and the "Member deleted." toast.

## 6. Test Borrowing

```txt
1. Select a book title from the dropdown.
2. Click the Employee RFID box and tap a registered RFID card.
3. Borrow button should enable.
4. Click Borrow.
5. Borrow History should show the new record, with exactly one success toast.
```

📸 **`test-09-borrow-rfid-recognized`**: the Borrow form with a book selected, the member's name shown under Employee RFID, and the **Borrow** button enabled.
📸 **`test-10-borrow-success`**: after clicking Borrow, the new record in Borrow History, the "Book borrowed successfully!" toast, and the book gone from the dropdown.

## 7. Test Returning

```txt
1. Select a borrowed book from the Return dropdown.
2. Tap the RFID card of the original borrower.
3. Return button should enable. (A different member's card must be rejected.)
4. Click Return.
5. The book should become available again.
```

📸 **`test-11-return-wrong-card`**: tapping a card of a **different** member, showing the rejection message and the **Return** button still disabled.
📸 **`test-12-return-verified`**: tapping the **original borrower's** card, showing "Verified" and the **Return** button enabled.
📸 **`test-13-return-success`**: after Return, the history showing `Yes` under Returned, and the book back in the Borrow dropdown.

## 8. Final Console Check

Go through all three tabs once more with the Console open.

📸 **`test-14-final-console`**: any tab with the Console open and **no red errors**.

---

# Screenshot Checklist

Tick each caption before you submit.

| Caption in your document | Taken when |
|---|---|
| `setup-01-api-running`, `setup-02-api-books-json` | Before Part 1 |
| `part-01-settings-apifetch` | After Part 1 |
| `early-01-toast`, `part-02-showtoast` | After Part 2 |
| `early-02-cache-console`, `part-03-caches` | After Part 3 |
| `early-03-tabs`, `part-04-tabs-refresh` | After Part 4 |
| `part-05-loadbooks` | After Part 5 |
| `part-06-deletebook` | After Part 6 |
| `part-07-addbook` | After Part 7 |
| `part-08-loadmembers` (or `08a` and `08b`) | After Part 8 |
| `part-09-deletemember` | After Part 9 |
| `part-10-addmember` | After Part 10 |
| `part-11-inline-rfid-editor` | After Part 11 |
| `part-12a-rfid-widget-builder`, `part-12b-rfid-init-functions` | After Part 12 |
| `part-13-borrow-dropdown` | After Part 13 |
| `part-14-return-dropdown` | After Part 14 |
| `part-15-borrow` | After Part 15 |
| `part-16-return` | After Part 16 |
| `part-17-loadborrows` | After Part 17 |
| `part-18-page-load` | After Part 18 |
| `test-01-page-loaded` | Testing Step 2 |
| `test-02-add-book`, `test-03-delete-book` | Testing Step 4 |
| `test-04-members-loaded` to `test-08-delete-member` (5 captions) | Testing Step 5 |
| `test-09-borrow-rfid-recognized`, `test-10-borrow-success` | Testing Step 6 |
| `test-11-return-wrong-card`, `test-12-return-verified`, `test-13-return-success` | Testing Step 7 |
| `test-14-final-console` | Testing Step 8 |

**Why the early checks?** Parts 1 to 4 do not need the rest of the code. Before Part 18, the **Add** and **Delete** buttons will show an error toast, because they call functions you have not written yet. So take the add, delete, borrow and return screenshots only after Part 18.

---

# Submit Your Document by Pull Request

Goal: your pull request (PR) contains **exactly one new file**, your `.docx`, inside your own folder under `Screenshots/` in the **`CCIT102-2A/LibraryBorrowingFrontEnd`** repository. It must **not** contain `app.js`, `index.html`, `style.css`, or anything else. Your instructor reviews the PR and merges it if it is correct.

Your `app.js` will show as modified (`M`) in VS Code. That is normal. **Do not commit it.**

## Steps

1. **Finish and save your document** inside `Screenshots/S<ID>_<Name>/` in your `LibraryBorrowingFrontEnd` folder (see **Screenshot Evidence — Setup**).

2. **Open a terminal in your `LibraryBorrowingFrontEnd` folder** and check the status:

```bash
git status
```

You will see `app.js` as modified and your `Screenshots` folder as untracked. Leave `app.js` alone.

3. **Create your own branch**, named with your student ID. Your unsaved changes stay on your computer.

```bash
git checkout -b submission/S2020000000
```

4. **Stage only your folder** (use your own folder name, with quotes):

```bash
git add "Screenshots/S2020000000_JohnGilbertSeñido"
```

5. **Check what is staged.** You must see exactly one line, ending in `.docx`:

```bash
git diff --cached --name-only
```

If you see anything else (`app.js`, for example), unstage it:

```bash
git restore --staged app.js
```

6. **Commit:**

```bash
git commit -m "Add screenshots - S2020000000 John Gilbert Señido"
```

If Git says it does not know who you are, run this once, then repeat the commit:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

7. **Push your branch to your fork** (`origin` is your fork, so you do not need permission to the instructor's repository):

```bash
git push -u origin submission/S2020000000
```

8. **Open the Pull Request.** On your fork's page on GitHub, click **Compare & pull request**, then check these fields carefully:

| Field | Value |
|---|---|
| Base repository | `CCIT102-2A/LibraryBorrowingFrontEnd` |
| Base branch | `main` |
| Head repository | `<your-username>/LibraryBorrowingFrontEnd` |
| Compare branch | `submission/S2020000000` |
| Title | `Screenshots - S2020000000 John Gilbert Señido` |

**Check the base repository.** Both repositories started as copies of `CCIT102-2B/LibraryBorrowingFrontEnd`, so GitHub may preselect the wrong one. If the base repository says `CCIT102-2B`, click it and change it to `CCIT102-2A/LibraryBorrowingFrontEnd`.

Click **Create pull request**.

9. **Check the PR.** Open the **Files changed** tab. It must show **one file**, your `.docx`. If it shows more, fix it with the table below.

10. **Wait for review.** If your instructor asks for changes, update your document, then repeat steps 4 to 7 on the **same branch**. The PR updates automatically. Do **not** merge your own PR.

## Never use these

They stage your whole project, including `app.js`:

```txt
git add .
git add -A
git commit -a
```

## Common Git Problems

| Problem | Fix |
|---|---|
| `git add` staged `app.js` (before commit) | `git restore --staged app.js`, then check again with `git diff --cached --name-only` |
| Committed `app.js` but **did not push yet** | `git reset --soft HEAD~1`, then `git restore --staged .`, then stage only your folder again |
| The PR shows extra files, or the base repository is `CCIT102-2B` | Close the PR and tell your instructor. Do not delete files yourself. |
| `fatal: not a git repository` | You are in the wrong folder. `cd` into your `LibraryBorrowingFrontEnd` folder. |
| The `.docx` is too big (over 20 MB) | In Word, select a picture, then `Picture Format → Compress Pictures`. Do not paste full-screen 4K images. |
| Blurry or half-visible code | Zoom the editor with `Ctrl +`, then take the screenshot of the function again |
| The folder name has a special character (for example `ñ`) and Git shows odd text | Use the plain letter (`n`) in both the folder and file name, and tell your instructor |

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

## The tabs or buttons do nothing

Part 4 is missing, or an earlier error stopped the script.

Fix: add Part 4, then check the Console (`F12`) for the first red error and fix that first.

---

## Error: `showToast is not defined`, `initRFID is not defined` or `refreshBookCache is not defined`

A part was skipped. Nothing is provided by the template in this activity.

Fix: use the Paste Map and add the missing part (Part 2 for `showToast`, Part 3 for the caches, Part 12 for the RFID functions).

---

## Error: `Cannot access '...' before initialization`

A variable such as `cachedBooks` is declared lower in the file than the code that uses it.

Fix: keep the Part 1 `let` lines at the very top, and Part 18 at the very bottom.

---

## Error: `Identifier '...' has already been declared`

A `let` or `function` was pasted twice (for example `cachedMembers`).

Fix: delete the duplicate.

---

## Error: `input is not defined` or `member is not defined`

`saveRfid()` was pasted outside `openInlineRfidEditor()`.

Fix: keep it inside that function (Part 11).

---

## Adding a book creates it twice, or borrowing shows an error toast even though the book was borrowed

The Add Book or Borrow listener was pasted twice, so two requests were sent.

Fix: search for `"form-add-book"` and `"form-borrow"` and delete the duplicate listener.

---

## The Return button does nothing

The `form-return` listener (Part 16) is missing, or the original borrower's RFID was not tapped first.

Fix: add Part 16 once, then tap the borrower's RFID card.

---

## `GET http://localhost:.../rfid.js 404`

`index.html` still loads a file that does not exist.

Fix: delete `<script src="rfid.js"></script>`.

---

## Table shows `Book #1` / `Member #2` instead of names

`loadBorrows()` ran before the caches were filled.

Fix: use the Part 18 order (call `loadBorrows()` last).

---

## Error: `Failed to fetch`

The API is not running.

Fix:

```bash
cd LibraryBorrowingAPI
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
3. You clicked the RFID box before scanning, so the scan field has focus.
4. The page was refreshed after registration.
5. The API is running.
```

---

# Student Reflection Questions

1. What does `apiFetch()` do?
2. Why do we use `try/catch` around API calls?
3. What is the difference between `POST` and `PUT`?
4. Why does RFID matching use `rfidValue` instead of `studentId`?
5. Why do we refresh tables after adding, deleting, borrowing, or returning?
6. Why does the Return dropdown use borrow record ID instead of book ID?
7. What happens if the same event listener is added to a form twice?
8. Why must the page-load code be at the bottom of the file?
9. Why does an RFID reader need `e.preventDefault()` on the Enter key?

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
