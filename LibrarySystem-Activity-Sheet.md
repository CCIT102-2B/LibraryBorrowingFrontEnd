# Activity Sheet with Code: Connect the Library Frontend to the API

## Activity Title
**Library Borrowing System — API to Frontend Implementation**

## Objective
Students will create `FrontEnd/app.js` and write the JavaScript code that connects the HTML frontend to the .NET Web API.

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

# Getting Started — Clone the Repo and Create Your Branch

Every student works on their **own branch**. Never commit your work to `main`.

## Branch Name Format

```txt
Section_StudentNumber_LastNameFirstName
```

Example:

```txt
IT2B_S2013101834_ManaloJohnEubert
```

| Part | Meaning | Example |
|------|---------|---------|
| `Section` | Your class section | `IT2B` |
| `StudentNumber` | Your student number | `S2013101834` |
| `LastNameFirstName` | Last name, then first name, joined with **no spaces** | `ManaloJohnEubert` |

Rules:

- Use underscores (`_`) between the three parts. No spaces anywhere in the name.
- Capitalize each name word (`DelaCruzJuanMiguel`, not `dela cruz juan miguel`).
- Use letters and numbers only — no dots, commas or `ñ`/accents (write `Nino`, not `Niño`).

## Step 1 — Check that Git is installed

Open a terminal (Command Prompt, PowerShell, or Git Bash) and run:

```bash
git --version
```

**Expected result:** a version number such as `git version 2.45.0`. If you get "command not found", install Git from https://git-scm.com and reopen the terminal.

## Step 2 — Clone the two repositories

The project has two repositories: the **API** (the .NET backend) and the **FrontEnd** (the page you will write code for). Clone both into your `Study` folder, using folder names that match the rest of this sheet:

```bash
cd C:\Users\<username>\Documents\Study
git clone https://github.com/CCIT102-2B/LibraryBorrowingAPI.git API
git clone https://github.com/CCIT102-2B/LibraryBorrowingFrontEnd.git FrontEnd
cd FrontEnd
```

Your folders should now look like this:

```txt
Study/
├── API/        ← LibraryBorrowingAPI (you only run this)
└── FrontEnd/   ← LibraryBorrowingFrontEnd (you work here)
```

The names `API` and `FrontEnd` at the end of each clone command make the folder names match the rest of this sheet.

## Step 3 — Create your branch

Replace the example with **your own** section, student number and name:

```bash
git checkout -b IT2B_S2013101834_ManaloJohnEubert
```

`-b` means "create a new branch and switch to it". (`git switch -c IT2B_S2013101834_ManaloJohnEubert` does the same thing.)

## Step 4 — Check that you are on your branch

```bash
git branch
```

**Expected result:** your branch is listed with a `*` in front of it:

```txt
  main
* IT2B_S2013101834_ManaloJohnEubert
```

Check the spelling carefully. If the name is wrong, rename it:

```bash
git branch -m IT2B_S2013101834_ManaloJohnEubert
```

## Step 5 — Publish your branch to GitHub

```bash
git push -u origin IT2B_S2013101834_ManaloJohnEubert
```

**Expected result:** the output ends with a line like `Branch 'IT2B_S2013101834_ManaloJohnEubert' set up to track 'origin/...'`. Open https://github.com/CCIT102-2B/LibraryBorrowingFrontEnd, click the branch drop-down, and confirm your branch is listed.

> If Git asks you to sign in, use your GitHub account. If a password is rejected, GitHub requires a **personal access token** instead of your account password — your instructor will show you how to make one.

## Step 6 — Run the API to make sure it works

You do **not** create a branch for the API. You only run it, and you never edit its code in this activity.

1. Check that the .NET SDK 8.0 or newer is installed:

   ```bash
   dotnet --version
   ```

   **Expected result:** a version number starting with `8` or higher. If the command is not found, install the .NET 8 SDK from https://dotnet.microsoft.com/download.

2. Start the API:

   ```bash
   cd C:\Users\<username>\Documents\Study\API
   dotnet run
   ```

   **Expected result:** the output includes `Now listening on: http://localhost:5000`. Leave this terminal open.

3. Open http://localhost:5000 in your browser. **Expected result:** the **Swagger UI** page listing the Books, Members and Borrows endpoints.

To stop the API, click the terminal and press `Ctrl+C`.

From this point on, do all of your work (creating `app.js`, editing, testing) on this branch. Run `git branch` any time you are unsure which branch you are on.

---

# Project Files

Students will work inside the `FrontEnd` folder you cloned in **Getting Started**, for example:

```txt
C:\Users\<username>\Documents\Study\FrontEnd
```

Main file you will create:

```txt
FrontEnd/app.js
```

`index.html` and `style.css` are already in the folder. Create a new file named `app.js` next to them (`index.html` loads it). Work through the parts below in order and type each part's code into `app.js`.

The RFID widget functions (`initRFID()`, `initRegRFID()`, `initReturnRFID()`, `openInlineRfidEditor()`) and `showToast()` are helper code supplied by your instructor. Make sure they are in `app.js` too, because the parts below call them.

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

# Testing as You Go

Test each part right after you write it. Do not wait until the end — a bug is much easier to find when only one new thing has changed.

**Before every test**

1. Start the API: `cd API` then `dotnet run` (leave it running).
2. Open `FrontEnd/index.html` in your browser. After you edit `app.js`, **refresh the page** (`F5`, or `Ctrl+F5` if the old code seems to stick).
3. Open the browser's developer tools with **`F12`**. You will use two tabs:
   - **Console** — shows red error messages, and lets you type code to test a function directly.
   - **Network** — shows every API call. Click a call to see its method, URL, status (200, 204, 404...) and the data sent and received.

**Sample data the API starts with** (reset every time you stop and re-run `dotnet run`):

| Type | Data |
|------|------|
| Books | 1 Clean Code (available) · 2 The Pragmatic Programmer (available) · 3 C# in Depth (borrowed) |
| Members | 1 Alice Johnson — RFID `A1B2C3D4` · 2 Bob Smith — RFID `E5F6A7B8` |
| Borrow record | 1 — C# in Depth borrowed by Alice, not returned |

**Simulating an RFID card:** no reader needed. Click the tap zone, type the RFID value, and press **Enter**.

**Tip:** if something goes wrong and the data gets messy, stop the API (`Ctrl+C`) and run `dotnet run` again to reset everything.

**How to read a test:** each "Test This Part" lists what to do and the **Expected result**. If the result is different, check the Console for a red error first.

---

# Helper Code: `apiFetch()`

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

## Test This Part

Test it directly in the Console (no page change needed):

1. Open the page, press `F12`, and click the **Console** tab.
2. Type this and press Enter:
   ```js
   await apiFetch("/books")
   ```
   **Expected result:** an array of 3 book objects.
3. Type this:
   ```js
   await apiFetch("/books/999")
   ```
   **Expected result:** a red error: `Book 999 not found.` This proves `apiFetch()` turns a 404 into a JavaScript error, which is what your `catch` blocks rely on.

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

## Test This Part

1. Refresh `index.html` and open the **Books** tab.
2. **Expected result:** a table with 3 rows. *Clean Code* and *The Pragmatic Programmer* have a green **Yes** badge; *C# in Depth* has a red **No** badge. Each row has a Delete button.
3. Open the **Network** tab and refresh again. **Expected result:** one `books` request with method `GET` and status `200`.
4. Click the **Refresh** button above the table. **Expected result:** the table reloads and a new `GET books` appears in Network.
5. **Error test:** stop the API (`Ctrl+C`), then click Refresh. **Expected result:** a red toast like `Could not load books: Failed to fetch`. Restart the API afterwards.

---

# Part 1.1 — Tab Navigation

## Complete Code

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

Add this to `app.js`. It switches panels, and it refreshes the dropdowns every time the Borrowing tab opens, so the lists are never stale.

## Test This Part

1. Click each tab: **Books**, **Members**, **Borrowing**.
2. **Expected result:** the clicked tab is highlighted and only its panel is visible.
3. Open the **Network** tab, then click **Borrowing**. **Expected result:** new requests for `members`, `books` and `borrows` appear (they fill the dropdowns).

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

## Test This Part

Add a book first (Part 3), or use *The Pragmatic Programmer* — you can restart the API to get it back.

1. Click **Delete** on a book. A confirm box appears.
2. Click **Cancel**. **Expected result:** nothing happens and no request appears in Network.
3. Click **Delete** again and press **OK**. **Expected result:** a green toast `Book deleted.`, the row disappears, and Network shows `DELETE books/<id>` with status `204`.
4. Open the **Borrowing** tab. **Expected result:** the deleted book is no longer in the Borrow dropdown.

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

## Test This Part

1. On the **Books** tab, fill in the form: Title `Test Book`, Author `Test Author`, ISBN `123-456`.
2. Click **Add Book**.
3. **Expected result:** a green toast `Book added!`, the form clears, and a new row appears with the next ID (4 if you started fresh), a green **Yes** badge, and the values you typed. The page does not reload.
4. In Network, click the `books` POST request and open **Payload**. **Expected result:** `{"title":"Test Book","author":"Test Author","isbn":"123-456"}` with status `201`.
5. Open the **Borrowing** tab. **Expected result:** *Test Book (Test Author)* is in the Borrow dropdown.

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

## Test This Part

1. Refresh the page and open the **Members** tab.
2. **Expected result:** 2 rows — Alice Johnson (`STU001`, RFID tag `A1B2C3D4`, `alice@uni.edu`) and Bob Smith (`STU002`, RFID tag `E5F6A7B8`, `bob@uni.edu`). Each row has a **Set** button and a Delete button.
3. Network shows `GET members` with status `200`.
4. **Check the dash:** add a member with no RFID (Part 6). **Expected result:** that row shows `—` instead of an RFID tag.

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

## Test This Part

Delete a member you added yourself (Part 6) so you keep the sample data.

1. Click **Delete** on that member and press **OK**.
2. **Expected result:** a green toast `Member deleted.`, the row disappears, and Network shows `DELETE members/<id>` with status `204`.
3. **Cache check:** open the Console and type `cachedMembers.length`. **Expected result:** the number matches the rows in the table.
4. Pressing **Cancel** on the confirm box must do nothing.

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

## Test This Part

1. On the **Members** tab, fill in Name `Test Member`, Student ID `STU999`, Email `test@uni.edu`.
2. Click the RFID tap zone, type `TEST1234`, and press **Enter**. **Expected result:** the zone shows "RFID captured ✔" and the RFID value box fills in.
3. Click **Add Member**.
4. **Expected result:** a green toast `Member added!`, the form **and** the RFID widget reset, and a new row with RFID tag `TEST1234`.
5. In Network, click the `members` POST request and open **Payload**. **Expected result:** it contains `name`, `studentId`, `email` and `rfidValue`.
6. **Duplicate warning:** type `A1B2C3D4` in the tap zone. **Expected result:** a warning "ID already registered" appears (you can still save, but do not).

---

# Part 7 — Update Existing Member RFID

## Endpoint

```txt
PUT /api/members/{id}
```

## Where this code goes

`saveRfid()` lives **inside** the function `openInlineRfidEditor(member, cell)`. That is why it can use the variables `input` and `member` without declaring them.

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

## Test This Part

1. On the **Members** tab, click **✎ Set** on Bob Smith. **Expected result:** the RFID cell turns into a small text box with ✓ and ✕ buttons.
2. Type `NEWCARD1` and press **Enter** (or click ✓).
3. **Expected result:** a green toast `RFID set for Bob Smith`, and Bob's row now shows `NEWCARD1`. His name, student ID and email are unchanged.
4. In Network, click the `members/2` PUT request. **Expected result:** status `204`, and the Payload contains all four fields (`name`, `studentId`, `email`, `rfidValue`).
5. **Empty test:** click Set, leave the box empty, and press Enter. **Expected result:** a red toast `Scan or type an RFID value first.` and no request is sent.
6. **Cancel test:** click Set, then press **Esc** or ✕. **Expected result:** the original RFID value comes back.
7. **Use it:** go to the Borrowing tab and tap `NEWCARD1`. **Expected result:** Bob is recognised (this also tests Part 8). Set Bob back to `E5F6A7B8` when you finish, or restart the API.

---

# Part 8 — Refresh Member Cache

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

## Test This Part

In the Console:

```js
await refreshMemberCache(); cachedMembers
```

**Expected result:** an array of your members (2 with the sample data). Add a member in the Members tab, run the same line again, and the array grows by 1.

---

# Part 9 — Find Member by RFID Value

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

## Test This Part

In the Console (run `await refreshMemberCache()` first):

```js
findMemberByRFID("A1B2C3D4")      // Alice's object
findMemberByRFID("a1b2c3d4")      // Alice's object (case does not matter)
findMemberByRFID("  E5F6A7B8  ")  // Bob's object (spaces are trimmed)
findMemberByRFID("UNKNOWN")       // null
findMemberByRFID("STU001")        // null  (student ID must NOT match)
```

**Expected result:** the comments show what each line should return. The last line proves matching uses `rfidValue`, not `studentId`.

---

# Part 10 — Refresh Book Cache

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

## Test This Part

In the Console:

```js
await refreshBookCache(); cachedBooks
```

**Expected result:** an array of all books (3 with the sample data). Add a book in the Books tab, run it again, and the array grows by 1.

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

## Test This Part

1. Open the **Borrowing** tab and look at the **Select a book** dropdown.
2. **Expected result:** it lists only available books — `Clean Code (Robert C. Martin)` and `The Pragmatic Programmer (Andrew Hunt)`. *C# in Depth* is **not** listed because it is borrowed.
3. In the Console, select a book and type `document.getElementById("borrow-bookselect").value`. **Expected result:** the book's ID, such as `"1"` — not the title.
4. **Empty test:** delete or borrow every available book. **Expected result:** the dropdown says `— No books available —`.

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

## Test This Part

1. Open the **Borrowing** tab and look at the **Return a Book** dropdown.
2. **Expected result:** one option: `C# in Depth ← Alice Johnson`.
3. Select it, then in the Console type `document.getElementById("return-bookselect").value`. **Expected result:** `"1"` — the **borrow record ID**, not the book ID (`3`).
4. **Empty test:** after returning every book, the dropdown says `— No books currently borrowed —`.

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

## Test This Part

1. Open the **Borrowing** tab. The **Borrow** button should be disabled.
2. Select `Clean Code`.
3. Click the RFID tap zone, type `A1B2C3D4`, and press **Enter**. **Expected result:** "Card recognised ✔", Alice Johnson's name appears, and the **Borrow** button turns on.
4. Click **Borrow**.
5. **Expected result:**
   - a green toast `Book borrowed successfully!`
   - the form and the RFID widget reset
   - the **Borrowing History** table has a new row: *Clean Code*, *Alice Johnson*, today's date, return date `—`, a red **No** badge
   - on the **Books** tab, *Clean Code* now shows a red **No**
   - *Clean Code* is gone from the Borrow dropdown and now appears in the Return dropdown
   - Network shows `POST borrows` with status `201` and payload `{"bookId":1,"memberId":1}`
6. **Unknown card test:** tap `ZZZ999`. **Expected result:** "Card not recognised ✖" and the Borrow button stays disabled.
7. **API error test:** in the Console, try to borrow the already-borrowed book:
   ```js
   await apiFetch("/borrows", { method: "POST", body: { bookId: 3, memberId: 1 } })
   ```
   **Expected result:** an error `Book 'C# in Depth' is not available.` (this is the message your `catch` would show in the toast).

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

## Test This Part

1. Open the **Borrowing** tab. In **Return a Book**, select `C# in Depth ← Alice Johnson`. The **Return** button should be disabled.
2. **Wrong card test:** tap Bob's card (`E5F6A7B8`). **Expected result:** "Card mismatch ✖", a message that the book was borrowed by Alice Johnson, and the Return button stays disabled.
3. Clear the widget and tap Alice's card (`A1B2C3D4`). **Expected result:** "Verified ✔" and the **Return** button turns on.
4. Click **Return**.
5. **Expected result:**
   - a green toast `Book returned successfully!`
   - the form and the RFID widget reset
   - the history row for that record now has a return date and a green **Yes** badge
   - on the **Books** tab, *C# in Depth* is a green **Yes** again
   - *C# in Depth* is back in the Borrow dropdown and gone from the Return dropdown
   - Network shows `PUT borrows/1/return` with status `204`
6. **Double-return test:** in the Console, run `await apiFetch("/borrows/1/return", { method: "PUT" })`. **Expected result:** an error `This book has already been returned.`

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

## Test This Part

1. Refresh the page and look at the **Borrowing History** table.
2. **Expected result:** one row from the sample data — ID `1`, **C# in Depth**, **Alice Johnson**, a borrow date from 5 days ago, return date `—`, and a red **No** badge. The Book and Borrower columns show real names, **not** `Book #3` / `Member #1`.
3. Borrow and return a book (Parts 13 and 14). **Expected result:** each action adds or updates a row without a page refresh.
4. Click the **Refresh** button above the table. **Expected result:** a new `GET borrows` request appears in Network.

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

Type this at the bottom of `app.js`, after every function it calls has been defined. The calls to `populateBorrowBookDropdown()` and `populateReturnDropdown()` must be inside the `.then()`, after the three RFID widgets are created.

## Test This Part

1. Close the tab and open `index.html` again (or press `F5`).
2. **Without clicking anything**, check that:
   - the **Books** table is filled
   - the **Members** table is filled
   - the **Borrowing History** table is filled with real names
   - the Borrow and Return dropdowns have options (open the Borrowing tab)
   - the RFID tap zones react when you click them
3. Check the **Console**. **Expected result:** no red errors.
4. **If a dropdown is empty or a tap zone does nothing,** the problem is almost always in this part: the calls are missing, or they run before the RFID widgets are created.

---

# Full Implementation Checklist

Your finished `FrontEnd/app.js` must contain:

```txt
[ ] API and FrontEnd repos cloned; API runs and shows Swagger at http://localhost:5000
[ ] FrontEnd branch created (Section_StudentNumber_LastNameFirstName)
[ ] API_BASE and apiFetch()
[ ] Part 1   — loadBooks()
[ ] Part 1.1 — Tab navigation
[ ] Part 2   — deleteBook(id)
[ ] Part 3   — Add Book form submit
[ ] Part 4   — loadMembers()
[ ] Part 5   — deleteMember(id)
[ ] Part 6   — Add Member form submit
[ ] Part 7   — saveRfid() (inside openInlineRfidEditor)
[ ] Part 8   — refreshMemberCache()
[ ] Part 9   — findMemberByRFID()
[ ] Part 10  — refreshBookCache()
[ ] Part 11  — populateBorrowBookDropdown()
[ ] Part 12  — populateReturnDropdown()
[ ] Part 13  — Borrow form submit
[ ] Part 14  — Return form submit
[ ] Part 15  — loadBorrows()
[ ] Part 16  — Initial page load
[ ] Work committed and pushed to your branch
[ ] Instructor-supplied helpers: showToast(), initRFID(), initRegRFID(), initReturnRFID(), openInlineRfidEditor()
```

---

# Testing Steps — Full Run-Through

The tests inside each part check one piece at a time. Do this final run once everything is finished, starting from a fresh `dotnet run`, to check that all the pieces work together.

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

> Use the sample data listed in **Testing as You Go** near the top of this sheet.

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

# Save and Submit Your Work

Commit and push regularly — for example after each part passes its test. Make sure you are on **your** branch first (`git branch`).

```bash
git status                                   # See which files changed
git add app.js                               # Stage your file
git commit -m "Complete Part 1 - loadBooks"  # Save a snapshot with a short message
git push                                     # Upload to your branch on GitHub
```

Good commit messages say what changed: `Complete Part 4 - loadMembers`, `Fix RFID duplicate check`.

When you are finished:

1. Run the full test in **Testing Steps — Full Run-Through**.
2. Commit and push your final `app.js`.
3. Open https://github.com/CCIT102-2B/LibraryBorrowingFrontEnd, switch to your branch, and confirm `app.js` shows your latest code.

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

## Error: `dotnet` is not recognized

The .NET SDK is not installed (or the terminal was open during installation). Install the .NET 8 SDK, close the terminal, open a new one, and run `dotnet --version` again.

---

## Error: `Address already in use` / port 5000 is busy

Another copy of the API is already running. Press `Ctrl+C` in that terminal (or close it) and run `dotnet run` again.

---

## Error: `fatal: not a git repository`

You are not inside the cloned folder. Run `cd C:\Users\<username>\Documents\Study\FrontEnd` and try again.

---

## Error: `fatal: a branch named '...' already exists`

You already created it. Switch to it instead of creating it again:

```bash
git checkout IT2B_S2013101834_ManaloJohnEubert
```

---

## Error: pushed to the wrong branch (`main`)

Run `git branch` before you push. If you committed on `main` by mistake, tell your instructor before pushing again.

---

## Error: `error: pathspec '...' did not match` or invalid branch name

The branch name has a space or a special character. Use only letters, numbers and underscores, in the format `Section_StudentNumber_LastNameFirstName`.

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

Add `populateBorrowBookDropdown()` and `populateReturnDropdown()` inside the `.then()` block in Part 16, after the three RFID widgets are created.

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
