// ============================================================
// STEP 1 — Set the base URL of your API
// Change the port if your API runs on a different address.
// ============================================================
const API_BASE = "http://localhost:5000/api";

// ============================================================
// Tab switching (provided — no changes needed)
// ============================================================
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "borrowing") {
      refreshMemberCache();
      populateBorrowBookDropdown();
      populateReturnDropdown();
    }
  });
});

// ============================================================
// Toast notification helper (provided — no changes needed)
// ============================================================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => { toast.className = "toast hidden"; }, 3000);
}

// ============================================================
// STEP 2 — apiFetch helper (provided — no changes needed)
// Wraps fetch() to handle JSON, errors, and 204 responses.
//
// Usage:
//   GET    →  apiFetch("/books")
//   POST   →  apiFetch("/books",   { method: "POST",   body: { title: "..." } })
//   PUT    →  apiFetch("/books/1", { method: "PUT",    body: { ... } })
//   DELETE →  apiFetch("/books/1", { method: "DELETE" })
// ============================================================
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

// ============================================================
// BOOKS
// ============================================================

// STEP 3 — Load all books from the API and display them in the table.
async function loadBooks() {
  // TODO: Call GET /api/books using apiFetch("/books")
  // Loop through the returned array and add a <tr> row for each book.
  // Each row should show: id, title, author, isbn, isAvailable, and a Delete button.
  //
  // Hint — build a row like this:
  //   const tbody = document.querySelector("#table-books tbody");
  //   tbody.innerHTML = "";
  //   books.forEach(b => {
  //     const row = document.createElement("tr");
  //     row.innerHTML = `<td>${b.id}</td> ...`;
  //     row.querySelector(".btn-delete").addEventListener("click", () => deleteBook(b.id));
  //     tbody.appendChild(row);
  //   });
}

// STEP 4 — Delete a book by ID.
async function deleteBook(id) {
  if (!confirm(`Delete book ID ${id}?`)) return;
  // TODO: Call DELETE /api/books/{id} using apiFetch(`/books/${id}`, { method: "DELETE" })
  // Then call loadBooks() to refresh the table.
  // Also call populateBorrowBookDropdown() so the deleted book disappears from the Borrow dropdown.
}

// STEP 5 — Add a new book via the form.
document.getElementById("form-add-book").addEventListener("submit", async e => {
  e.preventDefault();
  // TODO: Read the three form fields and call POST /api/books.
  //
  // const book = {
  //   title:  document.getElementById("book-title").value.trim(),
  //   author: document.getElementById("book-author").value.trim(),
  //   isbn:   document.getElementById("book-isbn").value.trim()
  // };
  // await apiFetch("/books", { method: "POST", body: book });
  // Then reset the form, reload books, and update populateBorrowBookDropdown().
});

document.getElementById("btn-refresh-books").addEventListener("click", loadBooks);

// ============================================================
// MEMBERS
// ============================================================

// STEP 6 — Load all members from the API and display them in the table.
async function loadMembers() {
  // TODO: Call GET /api/members using apiFetch("/members")
  // Each row should show: id, name, studentId, rfidValue, email, and a Delete button.
  // Also add a "✏ Set" button per row that calls openInlineRfidEditor(m, cell).
  //
  // Hint for the RFID value cell:
  //   const rfidDisplay = m.rfidValue
  //     ? `<span class="rfid-tag">${m.rfidValue}</span>`
  //     : '<span style="color:#a0aec0">—</span>';
}

// STEP 7 — Delete a member by ID.
async function deleteMember(id) {
  if (!confirm(`Delete member ID ${id}?`)) return;
  // TODO: Call DELETE /api/members/{id}
  // Then reload members and refresh the member cache.
}

// ============================================================
// RFID REGISTRATION WIDGET (provided — no changes needed)
// Captures an RFID card tap during member registration.
// ============================================================
function initRegRFID() {
  const tapZone    = document.getElementById("reg-rfid-tap-zone");
  const scanInput  = document.getElementById("reg-rfid-scan-input");
  const valueInput = document.getElementById("member-rfidvalue");
  const result     = document.getElementById("reg-rfid-result");
  const clearBtn   = document.getElementById("reg-rfid-clear-btn");
  const tapText    = document.getElementById("reg-rfid-tap-text");

  let lastKeyTime = 0;

  tapZone.addEventListener("click", () => scanInput.focus());

  scanInput.addEventListener("focus", () => {
    if (!valueInput.value) {
      tapZone.classList.add("rfid-focused");
      tapText.textContent = "Ready — tap card now";
    }
  });

  scanInput.addEventListener("blur", () => {
    if (!valueInput.value) {
      tapZone.classList.remove("rfid-focused");
      tapText.textContent = "Tap RFID Card to Register";
    }
  });

  scanInput.addEventListener("keydown", e => {
    lastKeyTime = Date.now();
    if (e.key === "Enter") {
      e.preventDefault();
      const val = scanInput.value.trim();
      if (val) applyScannedId(val);
      return;
    }
    if (scanInput.value === "") {
      tapZone.classList.remove("rfid-focused");
      tapZone.classList.add("rfid-scanning");
      tapText.textContent = "Scanning…";
    }
  });

  valueInput.addEventListener("input", () => {
    const val = valueInput.value.trim();
    if (!val) { resetReg(); return; }
    checkDuplicate(val);
  });

  valueInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      const val = valueInput.value.trim();
      if (val) checkDuplicate(val);
    }
  });

  function applyScannedId(value) {
    tapZone.classList.remove("rfid-scanning", "rfid-focused");
    scanInput.value  = "";
    valueInput.value = value;
    checkDuplicate(value);
    clearBtn.classList.remove("hidden");
  }

  function checkDuplicate(value) {
    const dup = cachedMembers.find(
      m => m.rfidValue && m.rfidValue.toLowerCase() === value.toLowerCase()
    );
    if (dup) {
      tapZone.classList.remove("rfid-scan-ok", "rfid-scan-err");
      tapZone.classList.add("rfid-scanning");
      tapText.textContent = "⚠ ID already registered";
      valueInput.className = "rfid-value-input rfid-dup-warn";
      result.className = "rfid-result err";
      result.innerHTML = `
        <div class="rfid-member-name">&#9888; Duplicate: ${value}</div>
        <div class="rfid-member-detail">Already assigned to ${dup.name}. You can still save.</div>
      `;
    } else {
      tapZone.classList.remove("rfid-scanning", "rfid-scan-err");
      tapZone.classList.add("rfid-scan-ok");
      tapText.textContent = "RFID captured ✔";
      valueInput.className = "rfid-value-input rfid-filled";
      result.className = "rfid-result ok";
      result.innerHTML = `
        <div class="rfid-member-name">&#x1F4F1; ${value}</div>
        <div class="rfid-member-detail">Card ready to register</div>
      `;
    }
    result.classList.remove("hidden");
    clearBtn.classList.remove("hidden");
  }

  function resetReg() {
    tapZone.className    = "rfid-tap-zone";
    tapText.textContent  = "Tap RFID Card to Register";
    result.className     = "rfid-result hidden";
    result.innerHTML     = "";
    valueInput.value     = "";
    valueInput.className = "rfid-value-input";
    clearBtn.classList.add("hidden");
    scanInput.value      = "";
    lastKeyTime          = 0;
  }

  clearBtn.addEventListener("click", resetReg);
  return { reset: resetReg };
}

let regRfid;

// STEP 8 — Add a new member via the form.
document.getElementById("form-add-member").addEventListener("submit", async e => {
  e.preventDefault();
  // TODO: Read form values and call POST /api/members.
  //
  // const member = {
  //   name:      document.getElementById("member-name").value.trim(),
  //   studentId: document.getElementById("member-studentid").value.trim(),
  //   email:     document.getElementById("member-email").value.trim(),
  //   rfidValue: document.getElementById("member-rfidvalue").value.trim()
  // };
  // await apiFetch("/members", { method: "POST", body: member });
  // Then reset the form, call regRfid.reset(), reload members, and refresh the member cache.
});

// Opens an inline RFID editor in the member table row (provided — no changes needed).
function openInlineRfidEditor(member, cell) {
  cell.innerHTML = `
    <div class="inline-rfid-editor">
      <input type="text" id="rfid-edit-${member.id}"
             class="inline-rfid-input" placeholder="Tap card or type…" autocomplete="off" />
      <button class="btn-rfid-save"   id="rfid-save-${member.id}"   title="Save">&#10003;</button>
      <button class="btn-rfid-cancel" id="rfid-cancel-${member.id}" title="Cancel">&#10005;</button>
    </div>
  `;
  const input = document.getElementById(`rfid-edit-${member.id}`);
  input.focus();

  async function saveRfid() {
    const newRfid = input.value.trim();
    if (!newRfid) { showToast("Scan or type an RFID value first.", "error"); return; }
    // TODO: Call PUT /api/members/{member.id} with the updated rfidValue.
    // Preserve all other fields: name, studentId, email.
    // Then reload members and refresh the member cache.
    //
    // await apiFetch(`/members/${member.id}`, {
    //   method: "PUT",
    //   body: { name: member.name, studentId: member.studentId, email: member.email, rfidValue: newRfid }
    // });
  }

  input.addEventListener("keydown", e => {
    if (e.key === "Enter")  { e.preventDefault(); saveRfid(); }
    if (e.key === "Escape") { loadMembers(); }
  });
  document.getElementById(`rfid-save-${member.id}`).addEventListener("click", saveRfid);
  document.getElementById(`rfid-cancel-${member.id}`).addEventListener("click", loadMembers);
}

document.getElementById("btn-refresh-members").addEventListener("click", loadMembers);

// ============================================================
// BORROWING
// ============================================================

// STEP 9 — Load borrow history and display it in the table.
async function loadBorrows() {
  // TODO: Call GET /api/borrows using apiFetch("/borrows")
  // Each row should show: id, book title, borrower name, borrowDate, returnDate, isReturned badge.
  //
  // Use cachedBooks and cachedMembers to look up titles and names:
  //   const book   = cachedBooks.find(b => b.id === r.bookId);
  //   const member = cachedMembers.find(m => m.id === r.memberId);
  //   const bookTitle  = book   ? book.title   : `Book #${r.bookId}`;
  //   const memberName = member ? member.name  : `Member #${r.memberId}`;
}

// ============================================================
// RFID CACHES & HELPERS (provided — no changes needed)
// ============================================================

let cachedMembers = [];
let cachedUnreturnedBorrows = [];

async function refreshMemberCache() {
  try { cachedMembers = await apiFetch("/members"); }
  catch { cachedMembers = []; }
}

let cachedBooks = [];

async function refreshBookCache() {
  try { cachedBooks = await apiFetch("/books"); }
  catch { cachedBooks = []; }
}

// STEP 10 — Populate the "Borrow a Book" dropdown with available books.
async function populateBorrowBookDropdown() {
  const select = document.getElementById("borrow-bookselect");
  if (!select) return;
  // TODO: Refresh the book cache, filter to only available books,
  // then build <option> elements and append them to the select.
  //
  // await refreshBookCache();
  // const available = cachedBooks.filter(b => b.isAvailable);
  // select.innerHTML = '<option value="">— Select a book —</option>';
  // available.forEach(b => {
  //   const opt = document.createElement("option");
  //   opt.value = b.id;
  //   opt.textContent = `${b.title} (${b.author})`;
  //   select.appendChild(opt);
  // });
}

// STEP 11 — Populate the "Return a Book" dropdown with currently borrowed books.
async function populateReturnDropdown() {
  const select = document.getElementById("return-bookselect");
  if (!select) return;
  // TODO: Call GET /api/borrows, filter to unreturned records,
  // store them in cachedUnreturnedBorrows, and build options
  // showing "Book Title ← Borrower Name" with value = borrow record ID.
  //
  // const records  = await apiFetch("/borrows");
  // const unreturned = records.filter(r => !r.isReturned);
  // cachedUnreturnedBorrows = unreturned;
  // select.innerHTML = '<option value="">— Select a book to return —</option>';
  // unreturned.forEach(r => {
  //   const book   = cachedBooks.find(b => b.id === r.bookId);
  //   const member = cachedMembers.find(m => m.id === r.memberId);
  //   const opt = document.createElement("option");
  //   opt.value = r.id;
  //   opt.textContent = `${book ? book.title : "Book #" + r.bookId} ← ${member ? member.name : "Member #" + r.memberId}`;
  //   select.appendChild(opt);
  // });
}

// Find a member strictly by their registered RFID card value (provided — no changes needed).
function findMemberByRFID(scannedValue) {
  const trimmed = scannedValue.trim();
  return cachedMembers.find(
    m => m.rfidValue && m.rfidValue.toLowerCase() === trimmed.toLowerCase()
  ) || null;
}

// ============================================================
// RFID BORROW WIDGET (provided — no changes needed)
// ============================================================
function initRFID() {
  const tapZone   = document.getElementById("rfid-tap-zone");
  const scanInput = document.getElementById("rfid-scan-input");
  const result    = document.getElementById("rfid-result");
  const clearBtn  = document.getElementById("rfid-clear-btn");
  const tapText   = document.getElementById("rfid-tap-text");
  const hiddenId  = document.getElementById("borrow-memberid");
  const borrowBtn = document.getElementById("btn-borrow");

  const RFID_CHAR_THRESHOLD_MS = 50;
  let lastKeyTime = 0;
  let isRFIDInput = false;

  tapZone.addEventListener("click", () => { refreshMemberCache(); scanInput.focus(); });

  scanInput.addEventListener("focus", () => {
    if (!hiddenId.value) {
      tapZone.classList.add("rfid-focused");
      tapText.textContent = "Ready — tap card now";
    }
  });

  scanInput.addEventListener("blur", () => {
    if (!hiddenId.value) {
      tapZone.classList.remove("rfid-focused");
      tapText.textContent = "Tap Employee RFID Card";
    }
  });

  scanInput.addEventListener("keydown", e => {
    const now = Date.now();
    const gap = now - lastKeyTime;
    lastKeyTime = now;
    if (e.key === "Enter") {
      e.preventDefault();
      const val = scanInput.value.trim();
      if (val) processRFIDScan(val);
      return;
    }
    if (scanInput.value === "") {
      isRFIDInput = true;
      tapZone.classList.remove("rfid-focused");
      tapZone.classList.add("rfid-scanning");
      tapText.textContent = "Scanning…";
    }
    if (gap > RFID_CHAR_THRESHOLD_MS && scanInput.value.length > 0) isRFIDInput = false;
  });

  async function processRFIDScan(value) {
    tapZone.classList.remove("rfid-scanning", "rfid-focused");
    let member = findMemberByRFID(value);
    if (!member) {
      tapText.textContent = "Verifying…";
      await refreshMemberCache();
      member = findMemberByRFID(value);
    }
    if (member) {
      tapZone.classList.add("rfid-scan-ok");
      tapText.textContent = "Card recognised ✔";
      result.className = "rfid-result ok";
      result.innerHTML = `
        <div class="rfid-member-name">&#128100; ${member.name}</div>
        <div class="rfid-member-detail">${member.studentId} &nbsp;|&nbsp; ID: ${member.id}</div>
      `;
      hiddenId.value     = member.id;
      borrowBtn.disabled = false;
      clearBtn.classList.remove("hidden");
    } else {
      tapZone.classList.add("rfid-scan-err");
      tapText.textContent = "Card not recognised ✖";
      result.className = "rfid-result err";
      result.innerHTML = `<div class="rfid-member-name">Unknown RFID: "${value}"</div>
        <div class="rfid-member-detail">No member matched. Clear and try again.</div>`;
      hiddenId.value     = "";
      borrowBtn.disabled = true;
      clearBtn.classList.remove("hidden");
    }
    scanInput.value = "";
  }

  function resetRFID() {
    tapZone.className   = "rfid-tap-zone";
    tapText.textContent = "Tap Employee RFID Card";
    result.className    = "rfid-result hidden";
    result.innerHTML    = "";
    hiddenId.value      = "";
    borrowBtn.disabled  = true;
    clearBtn.classList.add("hidden");
    scanInput.value     = "";
    isRFIDInput         = false;
    lastKeyTime         = 0;
  }

  clearBtn.addEventListener("click", resetRFID);
  return { reset: resetRFID };
}

// ============================================================
// RFID RETURN VERIFICATION WIDGET (provided — no changes needed)
// Verifies the card tapped matches the member who borrowed the book.
// ============================================================
function initReturnRFID() {
  const tapZone   = document.getElementById("return-rfid-tap-zone");
  const scanInput = document.getElementById("return-rfid-scan-input");
  const result    = document.getElementById("return-rfid-result");
  const clearBtn  = document.getElementById("return-rfid-clear-btn");
  const tapText   = document.getElementById("return-rfid-tap-text");
  const returnBtn = document.getElementById("btn-return");

  let lastKeyTime = 0;

  tapZone.addEventListener("click", () => { refreshMemberCache(); scanInput.focus(); });

  scanInput.addEventListener("focus", () => {
    if (returnBtn.disabled) {
      tapZone.classList.add("rfid-focused");
      tapText.textContent = "Ready — tap card now";
    }
  });

  scanInput.addEventListener("blur", () => {
    if (returnBtn.disabled) {
      tapZone.classList.remove("rfid-focused");
      tapText.textContent = "Tap Borrower's RFID Card";
    }
  });

  scanInput.addEventListener("keydown", e => {
    lastKeyTime = Date.now();
    if (e.key === "Enter") {
      e.preventDefault();
      const val = scanInput.value.trim();
      if (val) processReturnRFID(val);
      return;
    }
    if (scanInput.value === "") {
      tapZone.classList.remove("rfid-focused");
      tapZone.classList.add("rfid-scanning");
      tapText.textContent = "Scanning…";
    }
  });

  document.getElementById("return-bookselect").addEventListener("change", resetReturnRFID);

  async function processReturnRFID(value) {
    tapZone.classList.remove("rfid-scanning", "rfid-focused");
    scanInput.value = "";

    const selectedRecordId = parseInt(document.getElementById("return-bookselect").value);
    if (!selectedRecordId) {
      tapZone.classList.add("rfid-scan-err");
      tapText.textContent = "Select a book first ✖";
      result.className = "rfid-result err";
      result.innerHTML = `<div class="rfid-member-name">No book selected</div>
        <div class="rfid-member-detail">Choose a book from the dropdown, then tap the card.</div>`;
      result.classList.remove("hidden");
      clearBtn.classList.remove("hidden");
      return;
    }

    let member = findMemberByRFID(value);
    if (!member) {
      tapText.textContent = "Verifying…";
      await refreshMemberCache();
      member = findMemberByRFID(value);
    }

    if (!member) {
      tapZone.classList.add("rfid-scan-err");
      tapText.textContent = "Card not recognised ✖";
      result.className = "rfid-result err";
      result.innerHTML = `<div class="rfid-member-name">Unknown RFID: "${value}"</div>
        <div class="rfid-member-detail">No member matched this card. Clear and try again.</div>`;
      result.classList.remove("hidden");
      clearBtn.classList.remove("hidden");
      returnBtn.disabled = true;
      return;
    }

    const borrowRecord = cachedUnreturnedBorrows.find(r => r.id === selectedRecordId);
    if (borrowRecord && borrowRecord.memberId === member.id) {
      tapZone.classList.add("rfid-scan-ok");
      tapText.textContent = "Verified ✔";
      result.className = "rfid-result ok";
      result.innerHTML = `
        <div class="rfid-member-name">&#128100; ${member.name}</div>
        <div class="rfid-member-detail">${member.studentId} &nbsp;|&nbsp; Borrower confirmed</div>
      `;
      result.classList.remove("hidden");
      clearBtn.classList.remove("hidden");
      returnBtn.disabled = false;
    } else {
      tapZone.classList.add("rfid-scan-err");
      tapText.textContent = "Card mismatch ✖";
      const expectedMember = borrowRecord
        ? cachedMembers.find(m => m.id === borrowRecord.memberId)
        : null;
      const expectedName = expectedMember ? expectedMember.name : "the original borrower";
      result.className = "rfid-result err";
      result.innerHTML = `
        <div class="rfid-member-name">&#9888; Wrong card: ${member.name}</div>
        <div class="rfid-member-detail">This book was borrowed by <strong>${expectedName}</strong>.</div>
      `;
      result.classList.remove("hidden");
      clearBtn.classList.remove("hidden");
      returnBtn.disabled = true;
    }
  }

  function resetReturnRFID() {
    tapZone.className   = "rfid-tap-zone";
    tapText.textContent = "Tap Borrower's RFID Card";
    result.className    = "rfid-result hidden";
    result.innerHTML    = "";
    returnBtn.disabled  = true;
    clearBtn.classList.add("hidden");
    scanInput.value     = "";
    lastKeyTime         = 0;
  }

  clearBtn.addEventListener("click", resetReturnRFID);
  return { reset: resetReturnRFID };
}

let rfid;
let returnRfid;

// STEP 12 — Borrow form submit.
document.getElementById("form-borrow").addEventListener("submit", async e => {
  e.preventDefault();
  const bookId   = parseInt(document.getElementById("borrow-bookselect").value);
  const memberId = parseInt(document.getElementById("borrow-memberid").value);

  if (!memberId) { showToast("Please tap an RFID card first.", "error"); return; }

  // TODO: Call POST /api/borrows with { bookId, memberId }.
  // On success: reset the form, call rfid.reset(), then reload borrow history,
  // books, populateBorrowBookDropdown(), and populateReturnDropdown().
  //
  // await apiFetch("/borrows", { method: "POST", body: { bookId, memberId } });
});

// STEP 13 — Return form submit.
document.getElementById("form-return").addEventListener("submit", async e => {
  e.preventDefault();
  const recordId = document.getElementById("return-bookselect").value;
  if (!recordId) { showToast("Please select a book to return.", "error"); return; }

  // TODO: Call PUT /api/borrows/{recordId}/return.
  // On success: reset the form, call returnRfid.reset(), then reload borrow history,
  // books, populateBorrowBookDropdown(), and populateReturnDropdown().
  //
  // await apiFetch(`/borrows/${recordId}/return`, { method: "PUT" });
});

document.getElementById("btn-refresh-borrows").addEventListener("click", loadBorrows);

// ============================================================
// STEP 14 — Initial page load
// Call your load functions here so data appears when the page opens.
// ============================================================
loadBooks();
loadMembers().then(() => {
  refreshMemberCache().then(() => {
    rfid       = initRFID();
    regRfid    = initRegRFID();
    returnRfid = initReturnRFID();
    // TODO: Call populateBorrowBookDropdown() and populateReturnDropdown() here
    //   so the dropdowns are filled when the page first loads.
  });
});
refreshBookCache();
loadBorrows();
