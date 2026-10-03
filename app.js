
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