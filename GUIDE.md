# Student Guide: Connecting the Frontend to the .NET API

## What You Are Building

A library borrowing system split into two parts:
- **API** — a .NET 8 Web API that runs on your computer and stores data in memory.
- **FrontEnd** — plain HTML/CSS/JS files that run in your browser and talk to the API.

---

## Prerequisites

| Tool | Minimum Version | How to check |
|------|----------------|--------------|
| .NET SDK | 8.0 | `dotnet --version` |
| Any modern browser | Chrome, Edge, Firefox | — |

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

Leave this terminal open. The API must be running whenever you use the frontend.

**Verify it works:** Open your browser and go to `http://localhost:5000`.  
You should see the **Swagger UI** — an interactive page listing all available endpoints.

---

## Step 2 — Open the Frontend

Open File Explorer, navigate to `Study\FrontEnd\`, and double-click `index.html`.

It opens in your browser. The page immediately loads books, members, and borrow records from the API into the tables.

> If the tables show data, everything is connected.  
> If you see red error toasts, check Step 3 (CORS) and Step 5 (common errors).

---

## Step 3 — How CORS Works (and Why It Matters)

**The problem:** Browsers block JavaScript from calling a different "origin" (host + port) by default. Your HTML file is at `file://` or `localhost:PORT`, and the API is at `localhost:5000` — different origins.

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

---

## Step 4 — How fetch() Maps to API Endpoints

Every button in the frontend calls the API using the browser's built-in `fetch()` function. Here is the full mapping:

| Frontend Action | HTTP Method | API Endpoint |
|----------------|-------------|--------------|
| Load all books | GET | `GET /api/books` |
| Add a book | POST | `POST /api/books` |
| Delete a book | DELETE | `DELETE /api/books/{id}` |
| Load all members | GET | `GET /api/members` |
| Add a member | POST | `POST /api/members` |
| Delete a member | DELETE | `DELETE /api/members/{id}` |
| Load borrow history | GET | `GET /api/borrows` |
| Borrow a book | POST | `POST /api/borrows` |
| Return a book | PUT | `PUT /api/borrows/{id}/return` |

### Reading the `apiFetch` helper in `app.js`

All API calls go through a single helper function:

```javascript
async function apiFetch(path, options = {}) {
  const url = API_BASE + path;             // e.g. "http://localhost:5000/api/books"
  const config = { ...defaults, ...options };
  const response = await fetch(url, config);  // actual network call

  if (response.status === 204) return null;   // success but no body (DELETE / PUT)

  const data = JSON.parse(await response.text());
  if (!response.ok) throw new Error(data);    // turns HTTP errors into JS errors
  return data;
}
```

- `await` pauses the function until the network response arrives.
- `response.ok` is `true` when the HTTP status code is 200–299.
- The helper is at the top of `app.js` — every other function calls it.

### Example: borrowing a book

```javascript
// In app.js — what happens when you click "Borrow"
const payload = {
  bookId:   parseInt(document.getElementById("borrow-bookid").value),
  memberId: parseInt(document.getElementById("borrow-memberid").value)
};

await apiFetch("/borrows", { method: "POST", body: payload });
```

This sends:
```
POST http://localhost:5000/api/borrows
Content-Type: application/json

{ "bookId": 1, "memberId": 2 }
```

The API responds with the new `BorrowRecord` object, and the table refreshes.

---

## Step 5 — Common Errors and Fixes

### "Failed to fetch" / `net::ERR_CONNECTION_REFUSED`

The API is not running. Go back to your terminal and run `dotnet run` in the `API` folder.

---

### CORS error in browser console

```
Access to fetch at 'http://localhost:5000/...' has been blocked by CORS policy
```

Check that `app.UseCors("DevCors")` appears **before** `app.MapControllers()` in `Program.cs`.

---

### 400 Bad Request — "Book is not available"

The book you tried to borrow is already checked out. Check the Books table — its Available badge will show **No**.

---

### 404 Not Found

The ID you entered does not exist. Check the table for valid IDs.

---

### Tables are empty after restarting the API

Expected behaviour. All data lives in RAM. When you stop the API (`Ctrl+C`), added data is gone. The three seed books, two seed members, and one seed borrow record are re-created from `Program.cs` on every start.

---

## Summary Diagram

```
Browser (index.html / app.js)
         |
         |  fetch("http://localhost:5000/api/books")
         |  Content-Type: application/json
         v
.NET 8 Web API  (http://localhost:5000)
         |
         |  Access-Control-Allow-Origin: *   ← CORS header
         v
  BooksController  /  MembersController  /  BorrowsController
         |
         v
  List<Book>  /  List<Member>  /  List<BorrowRecord>
  (in-memory — lives only while `dotnet run` is active)
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
| POST | `/api/members` | `{name, studentId, email}` | Add a member |
| PUT | `/api/members/{id}` | `{name, studentId, email}` | Update a member |
| DELETE | `/api/members/{id}` | — | Delete a member |
| GET | `/api/borrows` | — | Get all borrow records |
| POST | `/api/borrows` | `{bookId, memberId}` | Borrow a book |
| PUT | `/api/borrows/{id}/return` | — | Return a book |

You can test all of these directly in the **Swagger UI** at `http://localhost:5000`.

---

*Happy coding!*
