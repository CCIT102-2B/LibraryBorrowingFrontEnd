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
let toastTimer;

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type}`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 3000);
}
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
  }document.querySelectorAll(".tab-btn").forEach(btn => {
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
  });async function loadBooks() {
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
  }document.getElementById("form-add-member").addEventListener("submit", async e => {
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