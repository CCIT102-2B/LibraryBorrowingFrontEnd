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

# Project Files

Students will work inside the `FrontEnd` folder of the project pulled from GitHub, for example:

```txt
C:\Users\<username>\Documents\Study\FrontEnd
```

Main file to edit:

```txt
FrontEnd/app.js
```

`app.js` already contains the tab switching, toast messages, and the three RFID widgets. Search the file for `// TODO` — those are the places you complete.

Do not edit the API code during this activity. Your task is to connect the existing frontend template to the running API.

---

# API Base URL

At the top of `app.js`, use:

```js
const API_BASE = "http://localhost:5000/api"; // Base address of the API
```

`API_BASE` already ends with `/api`, so the path you give `apiFetch()` starts with the resource name only:

| You write | The browser calls |
|-----------|-------------------|
| `apiFetch("/books")` | `http://localhost:5000/api/books` |
| `apiFetch("/members")` | `http://localhost:5000/api/members` |
| `apiFetch("/borrows")` | `http://localhost:5000/api/borrows` |

---

# Provided Helper Code: `apiFetch()`

Use this helper for all API calls.

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

## Complete Code

```js
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
```

## What the row template does

| Cell | Shows |
|------|-------|
| 1 | Book ID |
| 2 | Title |
| 3 | Author |
| 4 | ISBN |
| 5 | Green **Yes** badge if `isAvailable` is true, red **No** badge if false |
| 6 | Delete button (wired up on the lines after the template) |

> **Careful:** never put `// comments` or `<!-- comments -->` *inside* the backtick (`` ` ``) template. Everything between the backticks becomes real HTML text, so a comment there would show up inside your table.

## Student Task
Replace the `// TODO` inside `loadBooks()` with the code above.

---

# Part 1.1 — Tab Navigation

## Already provided

```js
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
```

This is already in `app.js`. It switches panels, and it refreshes the dropdowns every time the Borrowing tab opens, so the lists are never stale.

---

# Part 2 — Delete Book

## Endpoint

```txt
DELETE /api/books/{id}
```

## Complete Code with Brief Line-by-Line Explanation

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

## Complete Code

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
```

## What the row template does

| Cell | Shows |
|------|-------|
| 1 | Member ID |
| 2 | Name |
| 3 | Student ID |
| 4 | RFID value (or a dash) and a **Set** button that opens the inline RFID editor |
| 5 | Email |
| 6 | Delete button |

## Student Task
Replace the `// TODO` inside `loadMembers()` with the code above.

---

# Part 5 — Delete Member

## Endpoint

```txt
DELETE /api/members/{id}
```

## Complete Code with Brief Line-by-Line Explanation

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

## Where this code goes

`saveRfid()` is **inside** the provided function `openInlineRfidEditor(member, cell)`. That is why it can use the variables `input` and `member` without declaring them. Find the `// TODO` inside `saveRfid()` and add the `try / catch` shown below. The first lines (reading `newRfid` and checking it is not empty) are already there.

## Complete Code

```js
async function saveRfid() {
  const newRfid = input.value.trim();                                   // Read typed/scanned RFID value

  if (!newRfid) {                                                       // Check if RFID value is empty
    showToast("Scan or type an RFID value first.", "error");            // Show validation message
    return;                                                             // Stop function
  }

  try {                                                                 // Start error handling block
    await apiFetch(`/members/${member.id}`, {                           // Call PUT /api/members/{id}
      method: "PUT",                                                    // Use PUT to update full record
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
  } catch (err) {                                                       // Run if API call fails
    showToast(err.message, "error");                                    // Show error message
    loadMembers();                                                      // Restore table display
  }
}
```

## Important Explanation

`PUT` updates the whole member record. That is why the body must include all four fields:

```js
name       // Existing value
studentId  // Existing value
email      // Existing value
rfidValue  // New value
```

If you leave one out, the API saves it as an empty value.

---

# Part 8 — Refresh Member Cache

> ✅ **Already provided in `app.js` — read only.** You do not need to type this part. Read it so you understand how the rest of the page uses it.

## Complete Code with Brief Line-by-Line Explanation

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

> ✅ **Already provided in `app.js` — read only.** You do not need to type this part. Read it so you understand how the rest of the page uses it.

## Complete Code with Brief Line-by-Line Explanation

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

> ✅ **Already provided in `app.js` — read only.** You do not need to type this part. Read it so you understand how the rest of the page uses it.

## Complete Code with Brief Line-by-Line Explanation

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

## Complete Code with Brief Line-by-Line Explanation

```js
let cachedUnreturnedBorrows = [];                                       // Stores currently borrowed records

async function populateReturnDropdown() {                               // Function fills Return Book dropdown
  const select = document.getElementById("return-bookselect");          // Select return dropdown
  if (!select) return;                                                  // Stop if dropdown does not exist

  try {                                                                 // Start error handling block
    await Promise.all([refreshBookCache(), refreshMemberCache()]);      // Always load fresh books and members

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

## Complete Code

```js
async function loadBorrows() {                                          // Function loads borrow history
  try {                                                                 // Start error handling block
    await Promise.all([refreshBookCache(), refreshMemberCache()]);      // Get fresh books and members first

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
        <td>${r.id}</td>
        <td>${bookTitle}</td>
        <td>${memberName}</td>
        <td>${new Date(r.borrowDate).toLocaleDateString()}</td>
        <td>${r.returnDate ? new Date(r.returnDate).toLocaleDateString() : "—"}</td>
        <td><span class="badge ${r.isReturned ? "badge-green" : "badge-red"}">${r.isReturned ? "Yes" : "No"}</span></td>
      `;

      tbody.appendChild(row);                                           // Add row to table
    });
  } catch (err) {                                                       // Run if API call fails
    showToast("Could not load borrow records: " + err.message, "error"); // Show error message
  }
}
```

## Explanation

The API only gives IDs:

```js
bookId
memberId
```

The frontend converts them into readable names using:

```js
cachedBooks
cachedMembers
```

Notice the first line inside `try`: the caches are refreshed **before** the table is built. Without it, a page that has just opened (or a member who was just added) would show `Book #1` and `Member #2` instead of real names.

## Student Task
Replace the `// TODO` inside `loadBorrows()` with the code above.

---

# Part 16 — Initial Page Load

## Complete Code with Brief Line-by-Line Explanation

```js
loadBooks();                                                           // Load books table when page opens

loadMembers().then(() => {                                             // Load members first, then continue
  refreshMemberCache().then(() => {                                    // Fill RFID member cache
    rfid = initRFID();                                                 // Start Borrow RFID widget
    regRfid = initRegRFID();                                           // Start Registration RFID widget
    returnRfid = initReturnRFID();                                     // Start Return RFID widget
    populateBorrowBookDropdown();                                      // Fill Borrow Book dropdown
    populateReturnDropdown();                                          // Fill Return Book dropdown
  });
});

refreshBookCache();                                                    // Fill book cache
loadBorrows();                                                         // Load borrow history table
```

## Explanation

This runs automatically when the page opens.

The order matters because RFID and dropdowns need member and book data.

In `app.js` the first lines (`loadBooks()`, `loadMembers().then(...)`, `initRFID()` and so on) are already written. Your job is the `// TODO` inside the `.then()`: add `populateBorrowBookDropdown()` and `populateReturnDropdown()` there, after the three RFID widgets are created.

---

# Full Implementation Checklist

Complete every `// TODO` in `FrontEnd/app.js`:

```txt
[ ] Part 1  — loadBooks()
[ ] Part 2  — deleteBook(id)
[ ] Part 3  — Add Book form submit
[ ] Part 4  — loadMembers()
[ ] Part 5  — deleteMember(id)
[ ] Part 6  — Add Member form submit
[ ] Part 7  — saveRfid()  (inside openInlineRfidEditor)
[ ] Part 11 — populateBorrowBookDropdown()
[ ] Part 12 — populateReturnDropdown()
[ ] Part 13 — Borrow form submit
[ ] Part 14 — Return form submit
[ ] Part 15 — loadBorrows()
[ ] Part 16 — Initial page load (dropdown calls)
```

Already provided — read them, do not rewrite them:

```txt
apiFetch(), showToast(), tab navigation (Part 1.1)
refreshMemberCache()  (Part 8)
findMemberByRFID()    (Part 9)
refreshBookCache()    (Part 10)
initRFID(), initRegRFID(), initReturnRFID()  (RFID widgets)
```

---

# Testing Steps

## 1. Start the API

```bash
cd API
dotnet run
```

## 2. Open the FrontEnd

Open:

```txt
FrontEnd/index.html
```

> **Sample data the API starts with** (it is reset every time you run `dotnet run`):
>
> | Type | Data |
> |------|------|
> | Books | Clean Code, The Pragmatic Programmer (available) · C# in Depth (borrowed) |
> | Members | Alice Johnson — RFID `A1B2C3D4` · Bob Smith — RFID `E5F6A7B8` |
> | Borrow record | C# in Depth is borrowed by Alice |
>
> You can type these RFID values into the scan boxes and press **Enter** to simulate tapping a card.

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
2. Tap the RFID card of the original borrower (for the sample data: Alice, `A1B2C3D4`). Bob's card should be rejected with "Card mismatch".
3. Return button should enable.
4. Click Return.
5. The book should become available again.
```

---

# Common Errors and Fixes

## Error: `Failed to fetch`

The API is not running.

Fix:

```bash
cd API
dotnet run
```

---

## Error: Table shows `Book #1` or `Member #2` instead of names

The caches were empty when the table was built. Make sure `loadBorrows()` starts with:

```js
await Promise.all([refreshBookCache(), refreshMemberCache()]);
```

---

## Error: `Cannot read properties of undefined (reading 'reset')`

`rfid`, `regRfid`, or `returnRfid` is used before it was created. They are created inside the `loadMembers().then(...)` block in Part 16. Check that you did not delete or move those three lines.

---

## Error: Dropdown is empty on first load

Add `populateBorrowBookDropdown()` and `populateReturnDropdown()` inside the `.then()` block in Part 16 (the `// TODO` there).

---

## Error: Stray text like `// Display book ID` appears inside a table cell

A comment was typed *inside* a backtick template string. Remove everything that is not real HTML from between the backticks.

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
7. Why does `loadBorrows()` refresh `cachedBooks` and `cachedMembers` before building the table?

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
