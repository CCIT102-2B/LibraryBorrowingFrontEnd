# Student Guide: Connecting the Frontend to the .NET API

## What You Are Building

A library borrowing system split into two parts:
- **API**: a .NET 8 Web API that runs on your computer and stores data in memory.
- **FrontEnd**: plain HTML/CSS/JS files that run in your browser and talk to the API. Members are identified by **RFID cards**.

**Your job:** the API and the HTML page already exist. You write `FrontEnd/app.js`, which connects them. Follow `LibrarySystem-Activity-Sheet.md` for the code, part by part.

---

## Prerequisites

| Tool | Minimum Version | How to check |
|------|----------------|--------------|
| .NET SDK | 8.0 | `dotnet --version` |
| Any modern browser | Chrome, Edge, Firefox | — |
| Code editor | VS Code recommended | `code --version` |

You do **not** need Node.js, npm, or any other tool.

---

## Step 1 — Run the API

Open a terminal (Command Prompt, PowerShell, or Git Bash) and navigate to the `API` folder:

```
cd path\to\Study\API
dotnet run
```

You should see output like:

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

**Write down the port.** If it is not `5000` (for example `5123`), set the same port in `API_BASE` at the top of `app.js`:

```javascript
const API_BASE = "http://localhost:5123/api";
```

Leave this terminal open. The API must be running whenever you use the frontend.

**Verify it works:** Open your browser and go to `http://localhost:5000` (use your port).
You should see the **Swagger UI**, an interactive page listing all available endpoints. You can also open `http://localhost:5000/api/books` and you should see JSON.

---

## Step 2 — Write `app.js`, Then Open the Frontend

### Before you write code

`FrontEnd/` contains:

| File | Status |
|------|--------|
| `index.html` | Already built |
| `style.css` | Already built |
| `app.js` | **Starts empty. You write it.** |

`app.js` begins with only this comment, which you delete:

```javascript
// ============================================================
// PLACE CODE HERE, PLEASE DELETE THIS COMMENT
// ============================================================
```

There is no `rfid.js` and no hidden helper code. Everything goes in `app.js`: the API helper, toast messages, caches, tabs, RFID scanners, tables, forms and dropdowns. If `index.html` contains this line, delete it, because the file does not exist:

```html
<script src="rfid.js"></script>
```

### Open the page

Open File Explorer, navigate to `Study\FrontEnd\`, and double-click `index.html`.

Once `app.js` is complete, the page loads books, members and borrow records from the API into the tables when it opens.

> If the tables show data, everything is connected.
> If nothing happens, press `F12` and read the red errors in the **Console** tab.
> If you see red error toasts, check Step 3 (CORS) and Step 7 (common errors).

---

## Step 3 — How CORS Works (and Why It Matters)

**The problem:** Browsers block JavaScript from calling a different "origin" (host + port) by default. Your HTML file is at `file://` or `localhost:PORT`, and the API is at `localhost:5000`, which are different origins.

**The fix:** The API sends special response headers that tell the browser "this request is allowed":

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
```

In `Program.cs`, this is configured with:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// ...

app.UseCors("DevCors");   // must come BEFORE app.MapControllers()
app.MapControllers();
```

> In production you would replace `AllowAnyOrigin()` with your frontend's actual URL.
> For local development, `AllowAnyOrigin()` is safe.
> CORS is an API setting. Do not edit the API during this activity; ask your instructor if you see a CORS error.

---

## Step 4 — How fetch() Maps to API Endpoints

Every button in the frontend calls the API using the browser's built-in `fetch()` function. Here is the full mapping:

| Frontend Action | HTTP Method | API Endpoint |
|----------------|-------------|--------------|
| Load all books | GET | `GET /api/books` |
| Add a book | POST | `POST /api/books` |
| Delete a book | DELETE | `DELETE /api/books/{id}` |
| Load all members | GET | `GET /api/members` |
| Add a member (with RFID value) | POST | `POST /api/members` |
| Set / change a member's RFID | PUT | `PUT /api/members/{id}` |
| Delete a member | DELETE | `DELETE /api/members/{id}` |
| Load borrow history | GET | `GET /api/borrows` |
| Borrow a book | POST | `POST /api/borrows` |
| Return a book | PUT | `PUT /api/borrows/{id}/return` |

### Reading the `apiFetch` helper in `app.js`

All API calls go through a single helper function:

```javascript
async function apiFetch(path, options = {}) {
  const url = API_BASE + path;                       // e.g. "http://localhost:5000/api/books"
  const defaults = { headers: { "Content-Type": "application/json" } };
  const config = { ...defaults, ...options };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);       // JS object -> JSON text
  }

  const response = await fetch(url, config);         // actual network call

  if (response.status === 204) return null;          // success but no body (DELETE / PUT)

  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!response.ok) {
    throw new Error(typeof data === "string" ? data : JSON.stringify(data));  // HTTP error -> JS error
  }

  return data;
}
```

- `await` pauses the function until the network response arrives.
- `response.ok` is `true` when the HTTP status code is 200–299.
- `API_BASE` already ends in `/api`, so write `apiFetch("/books")`, never `apiFetch("/api/books")`.
- The helper is at the top of `app.js` (Part 1 of the activity sheet). Every other function calls it.

### Example: borrowing a book

The Borrow form has two inputs: a **book dropdown** and an **RFID card tap**. The tap finds the member and stores the member id in a hidden field.

```javascript
// In app.js, what happens when you click "Borrow"
const bookId   = parseInt(document.getElementById("borrow-bookselect").value);
const memberId = parseInt(document.getElementById("borrow-memberid").value);  // filled by the RFID tap

await apiFetch("/borrows", { method: "POST", body: { bookId, memberId } });
```

This sends:
```
POST http://localhost:5000/api/borrows
Content-Type: application/json

{ "bookId": 1, "memberId": 2 }
```

The API responds with the new `BorrowRecord` object, and the tables refresh.

---

## Step 5 — How RFID Works in This App

An RFID card reader acts like a **keyboard**. When you tap a card it quickly types the card's number and presses **Enter**.

The page has three RFID boxes. Click the box first so the hidden scan field has focus, then tap the card.

| Where | What a tap does |
|-------|-----------------|
| **Members tab, "RFID Value"** | Puts the card number into the new member's RFID value field. A card already registered to someone is rejected. |
| **Borrowing tab, "Employee RFID"** | Finds the member whose `rfidValue` matches the card, then enables the **Borrow** button. |
| **Borrowing tab, "Borrower RFID"** (Return) | Enables the **Return** button only if the card belongs to the member who borrowed the selected book. |

Important rules:

- A card is matched against the member's **`rfidValue`**, never against `studentId` or `id`. The Student ID is typed by a person. The RFID value is the card's number.
- Matching uses a cache of members loaded from the API. The cache is refreshed after you add, change or delete a member.
- You do not have a reader? Type the value into the scan field and press **Enter**.

To change an existing member's card, click **Set** in the Members table, scan or type the new value, then press **Save** (or Enter). **Esc** cancels. This sends a `PUT` that includes the member's full record, because `PUT` replaces the whole record:

```javascript
{ name, studentId, email, rfidValue: newValue }
```

---

## Step 6 — What the Page Needs From `app.js`

`app.js` finds HTML elements by `id`, so the names in the code must match `index.html`. In order, your finished `app.js` contains:

1. Settings, shared variables and `apiFetch()`
2. `showToast()` (the small pop-up messages)
3. Member and book caches, and `findMemberByRFID()`
4. Tab buttons and Refresh buttons
5. Books: load, delete, add
6. Members: load, delete, add, and the inline RFID editor
7. The three RFID widgets
8. Dropdowns for Borrow and Return
9. Borrow, Return and Borrow History
10. The page-load calls (**last**, so the caches are ready first)

Order matters. Variables must be declared before they are used, and the page-load code must be at the bottom. The activity sheet gives the exact order as Parts 1 to 18.

---

## Step 7 — Common Errors and Fixes

### "Failed to fetch" / `net::ERR_CONNECTION_REFUSED`

The API is not running, or `API_BASE` has the wrong port. Go back to your terminal, run `dotnet run` in the `API` folder, and make sure the port matches.

---

### CORS error in browser console

```
Access to fetch at 'http://localhost:5000/...' has been blocked by CORS policy
```

Check that `app.UseCors("DevCors")` appears **before** `app.MapControllers()` in `Program.cs`. This is an API setting, so ask your instructor.

---

### The tabs or buttons do nothing

The tab code is missing, or an earlier error stopped the script. Press `F12`, open the **Console**, and fix the **first** red error.

---

### `showToast is not defined` / `initRFID is not defined` / `refreshBookCache is not defined`

A part of `app.js` was skipped. Nothing is provided for you. Use the Paste Map in the activity sheet to find and add the missing part.

---

### `Identifier '...' has already been declared`

Something was pasted twice (for example `let cachedBooks`). Delete the duplicate.

---

### `Cannot access '...' before initialization`

A variable is declared lower in the file than the code that uses it. Keep the variable declarations at the very top and the page-load code at the very bottom.

---

### Adding a book creates two books, or borrowing shows an error even though it worked

The Add Book or Borrow listener was pasted twice, so two requests were sent. Search the file for `"form-add-book"` and `"form-borrow"`, and delete the duplicate listener.

---

### The Return button does nothing

Either the Return form listener is missing, or the original borrower's RFID card has not been tapped yet. Select the book, then tap the borrower's card.

---

### `input is not defined` when saving an RFID

`saveRfid()` was placed outside `openInlineRfidEditor()`. It must be inside that function.

---

### `GET .../rfid.js 404`

`index.html` still loads a file that does not exist. Delete `<script src="rfid.js"></script>`.

---

### "RFID not recognized"

- The member has no RFID value saved.
- The value was typed differently from the one saved (spaces count; letter case does not).
- You did not click the RFID box first, so the scan field was not focused.
- The member list changed and the page was not refreshed.

---

### History shows `Book #1` / `Member #2` instead of names

`loadBorrows()` ran before the book and member caches were filled. Call it last in the page-load code.

---

### 400 Bad Request: "Book is not available"

The book you tried to borrow is already checked out. Check the Books table; its Available badge will show **No**.

---

### 404 Not Found

Either the ID does not exist, or the path is wrong. Correct: `apiFetch("/books")`. Wrong: `apiFetch("/api/books")`.

---

### Tables are empty after restarting the API

Expected behaviour. All data lives in RAM. When you stop the API (`Ctrl+C`), added data is gone. The seed data is re-created from `Program.cs` on every start.

---

## Summary Diagram

```
Browser (index.html / app.js)
         |
         |  RFID tap -> findMemberByRFID() -> memberId
         |
         |  fetch("http://localhost:5000/api/borrows")
         |  Content-Type: application/json
         v
.NET 8 Web API  (http://localhost:5000)
         |
         |  Access-Control-Allow-Origin: *   <- CORS header
         v
  BooksController  /  MembersController  /  BorrowsController
         |
         v
  List<Book>  /  List<Member>  /  List<BorrowRecord>
  (in-memory, lives only while `dotnet run` is active)
```

---

## Quick Reference: API Endpoints

| Method | URL | Body | Description |
|--------|-----|------|-------------|
| GET | `/api/books` | — | Get all books |
| GET | `/api/books/{id}` | — | Get one book |
| POST | `/api/books` | `{title, author, isbn}` | Add a book |
| PUT | `/api/books/{id}` | `{title, author, isbn, isAvailable}` | Update a book |
| DELETE | `/api/books/{id}` | — | Delete a book |
| GET | `/api/members` | — | Get all members |
| GET | `/api/members/{id}` | — | Get one member |
| POST | `/api/members` | `{name, studentId, email, rfidValue}` | Add a member |
| PUT | `/api/members/{id}` | `{name, studentId, email, rfidValue}` | Update a member (send the whole record) |
| DELETE | `/api/members/{id}` | — | Delete a member |
| GET | `/api/borrows` | — | Get all borrow records |
| POST | `/api/borrows` | `{bookId, memberId}` | Borrow a book |
| PUT | `/api/borrows/{id}/return` | — | Return a book |

You can test all of these directly in the **Swagger UI** at `http://localhost:5000`.

---

*Happy coding!*