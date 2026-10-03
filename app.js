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
          <td><span class="badge ${b.isAvailable ? "badge-green" : "badge-red"}">${b.isAvailable ? "Yes" : "No"}</span></td>
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

  async function saveRfid() {
    const newRfid = input.value.trim();                                   
  
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

  let cachedMembers = [];                                                 // Stores latest members from API

async function refreshMemberCache() {                                   // Function updates member cache
  try {                                                                 // Start error handling block
    cachedMembers = await apiFetch("/members");                         // Load members from API into cache
  } catch {                                                             // Run if API call fails
    cachedMembers = [];                                                 // Use empty array to avoid errors
  }
}

function findMemberByRFID(scannedValue) {                               // Function receives scanned RFID value
    const trimmed = scannedValue.trim();                                  // Remove extra spaces
  
    return cachedMembers.find(                                            // Search members array
      m => m.rfidValue &&                                                 // Make sure member has RFID value
           m.rfidValue.toLowerCase() === trimmed.toLowerCase()            // Compare RFID values case-insensitively
    ) || null;                                                            // Return found member or null
  }