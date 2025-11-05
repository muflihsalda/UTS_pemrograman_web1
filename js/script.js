// script.js - fungsi shared untuk semua halaman

// util: baca data dari localStorage
function getKatalog(){
  const raw = localStorage.getItem("katalog");
  return raw ? JSON.parse(raw) : [];
}
function saveKatalog(arr){
  localStorage.setItem("katalog", JSON.stringify(arr));
}
function getOrders(){
  const raw = localStorage.getItem("orders");
  return raw ? JSON.parse(raw) : [];
}
function saveOrders(arr){
  localStorage.setItem("orders", JSON.stringify(arr));
}

// ---- Auth (login) ----
function validateEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function loginSubmit(e){
  e && e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  if(!validateEmail(email)){
    alert("Masukkan email valid.");
    return;
  }
  if(pass.length < 4){
    alert("Password minimal 4 karakter.");
    return;
  }
  const found = (typeof users !== "undefined") ? users.find(u => u.email === email && u.password === pass) : null;
  if(found){
    sessionStorage.setItem("loggedInUser", JSON.stringify({id:found.id, name:found.name, email:found.email}));
    window.location.href = "dashboard.html";
  } else {
    alert("Email/password yang Anda masukkan salah.");
    return;
  }
}

function logout(){
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

// ---- Modal (register/forgot) ----
function openModal(id){ const el = document.getElementById(id); if(el) el.style.display = "block"; }
function closeModal(id){ const el = document.getElementById(id); if(el) el.style.display = "none"; }

// ---- Greeting based on local time ----
function renderGreeting(elementId){
  const now = new Date();
  const h = now.getHours();
  let greeting = "Selamat";
  if(h < 11) greeting = "Selamat pagi";
  else if(h < 15) greeting = "Selamat siang";
  else if(h < 18) greeting = "Selamat sore";
  else greeting = "Selamat malam";
  const user = JSON.parse(sessionStorage.getItem("loggedInUser") || "null");
  const name = user ? user.name : "Pengunjung";
  const el = document.getElementById(elementId);
  if(el) el.innerText = `${greeting}, ${name}`;
}

// ---- Dashboard: ringkasan ----
function renderDashboardStats(){
  const katalog = getKatalog();
  const orders = getOrders();
  const elBooks = document.getElementById("statBooks");
  const elOrders = document.getElementById("statOrders");
  if(elBooks) elBooks.innerText = katalog.length;
  if(elOrders) elOrders.innerText = orders.length;
}

// ---- Stok: render tabel ----
function renderStockTable(){
  const katalog = getKatalog();
  const tbody = document.getElementById("stok-body");
  if(!tbody) return;
  tbody.innerHTML = "";

  katalog.forEach((b) => {
    const tr = document.createElement("tr");

    // pastikan path gambar benar, arahkan ke folder img/
    let imgSrc = b.img;
    if(!imgSrc || imgSrc.trim() === "" || imgSrc === "assets/logo.png"){
      // fallback otomatis berdasarkan struktur folder UTS
      imgSrc = `img/${b.title.toLowerCase().replace(/\s+/g, "_")}.jpg`;
    }

    tr.innerHTML = `
      <td>${b.id}</td>
      <td style="display:flex;align-items:center;gap:8px;">
        <img src="${imgSrc}" alt="${b.title}" 
             style="width:48px;height:60px;object-fit:cover;margin-right:8px;"
             onerror="this.onerror=null;this.src='assets/logo.png';">
        <div><strong>${b.title}</strong><br><small>${b.author}</small></div>
      </td>
      <td>Rp ${b.price.toLocaleString()}</td>
      <td><input type="number" min="0" value="${b.stock}" onchange="updateStock('${b.id}', this.value)"></td>
      <td><button onclick="deleteBook('${b.id}')">Hapus</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- Update stok, hapus buku, tambah buku ----
function updateStock(id, value){
  const katalog = getKatalog();
  const idx = katalog.findIndex(x => x.id === id);
  if(idx >= 0){
    katalog[idx].stock = parseInt(value) || 0;
    saveKatalog(katalog);
    renderStockTable();
    showToast("📦 Stok buku diperbarui!");
  }
}


function deleteBook(id){
  if(!confirm("Hapus buku ini?")) return;
  const katalog = getKatalog().filter(b => b.id !== id);
  saveKatalog(katalog);
  renderStockTable();
    showToast("🗑️ Buku berhasil dihapus!", "#dc3545");
}

function addNewBook(e){
  e && e.preventDefault();
  const id = document.getElementById("new-id").value.trim();
  const title = document.getElementById("new-title").value.trim();
  const author = document.getElementById("new-author").value.trim();
  const price = parseInt(document.getElementById("new-price").value) || 0;
  const stock = parseInt(document.getElementById("new-stock").value) || 0;
  const img = document.getElementById("new-img").value.trim();

  if(!id || !title){ alert("ID dan Judul wajib diisi."); return; }
  const katalog = getKatalog();
  if(katalog.find(x=>x.id===id)){ alert("ID sudah ada."); return; }

  katalog.push({id, title, author, price, stock, img});
  saveKatalog(katalog);
  document.getElementById("form-new-book").reset();
  renderStockTable();

  showToast("✅ Buku baru berhasil ditambahkan!");
}


// ---- Checkout: cart management ----
let cart = [];

function populateBookOptions(){
  const katalog = getKatalog();
  const sel = document.getElementById("select-book");
  if(!sel) return;
  sel.innerHTML = katalog.map(b => `<option value="${b.id}">${b.title} - Rp ${b.price.toLocaleString()} (stok ${b.stock})</option>`).join("");
}

function addToCart(e){
  e && e.preventDefault();
  const id = document.getElementById("select-book").value;
  const qty = parseInt(document.getElementById("qty").value) || 1;
  const katalog = getKatalog();
  const book = katalog.find(b=>b.id===id);
  if(!book) return alert("Buku tidak ditemukan.");
  if(qty > book.stock) return alert("Jumlah melebihi stok.");
  const exist = cart.find(c=>c.id===id);
  if(exist) exist.qty += qty; else cart.push({id:book.id, title:book.title, price:book.price, qty});
  renderCart();
}

function renderCart(){
  const el = document.getElementById("cart-body");
  if(!el) return;
  el.innerHTML = "";
  let total = 0;
  cart.forEach((c, i) => {
    const line = c.price * c.qty;
    total += line;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.title}</td>
      <td>${c.qty}</td>
      <td>Rp ${c.price.toLocaleString()}</td>
      <td>Rp ${line.toLocaleString()}</td>
      <td><button onclick="removeCart(${i})">Hapus</button></td>
    `;
    el.appendChild(tr);
  });
  const totalEl = document.getElementById("cart-total");
  if(totalEl) totalEl.innerText = `Rp ${total.toLocaleString()}`;
}

function removeCart(index){
  cart.splice(index,1);
  renderCart();
}

function placeOrder(e){
  e && e.preventDefault();
  if(cart.length === 0) return alert("Keranjang kosong.");
  const name = document.getElementById("cust-name").value.trim();
  const address = document.getElementById("cust-address").value.trim();
  if(!name || !address) return alert("Isi nama dan alamat pemesan.");
  const katalog = getKatalog();
  let insufficient = false;
  cart.forEach(c => {
    const book = katalog.find(b=>b.id===c.id);
    if(book){
      if(c.qty > book.stock) insufficient = true;
      else book.stock = Math.max(0, book.stock - c.qty);
    }
  });
  if(insufficient) { alert("Jumlah pada keranjang melebihi stok terkini. Periksa kembali."); return; }
  saveKatalog(katalog);

  const orders = getOrders();
  const now = new Date();
  const dn = `DO${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(Math.floor(Math.random()*900)+100)}`;
  const total = cart.reduce((s,c)=>s + c.price*c.qty, 0);
  const newOrder = {
    deliveryNumber: dn,
    name,
    address,
    items: JSON.parse(JSON.stringify(cart)),
    total,
    status: "Dikemas",
    expedition: { courier: "JNE", date: now.toISOString().split('T')[0], type: "Reguler" }
  };
  orders.push(newOrder);
  saveOrders(orders);
  cart = [];
  renderCart();
  populateBookOptions();
  renderStockTable();
  alert(`Order berhasil dibuat. No. Delivery: ${dn}`);
  sessionStorage.setItem("lastOrder", dn);
  
  showToast("🛒 Pesanan berhasil dibuat!");

}

// ---- Tracking ----
function trackingSearch(e){
  e && e.preventDefault();
  const no = document.getElementById("tracking-no").value.trim();
  const orders = getOrders();
  const found = orders.find(o=>o.deliveryNumber === no);
  const el = document.getElementById("tracking-result");
  if(!el) return;
  if(found){
    el.innerHTML = buildTrackingHtmlFromOrder(found);
    return;
  }
  if(typeof dataTracking !== "undefined" && dataTracking[no]){
    const d = dataTracking[no];
    el.innerHTML = `
      <h3>${d.nomorDO}</h3>
      <p>Nama Pemesan: ${d.nama}</p>
      <p>Status: <strong>${d.status}</strong></p>
      <p>Ekspedisi: ${d.ekspedisi}</p>
      <p>Tanggal Kirim: ${d.tanggalKirim}</p>
      <p>Jenis Paket: ${d.paket}</p>
      <p>Total Pembayaran: ${d.total}</p>
      <h4>Riwayat perjalanan:</h4>
      <ul>${d.perjalanan.map(p => `<li>${p.waktu} — ${p.keterangan}</li>`).join('')}</ul>
      <div style="margin-top:8px;">${renderProgressBar(d.status)}</div>
    `;
    return;
  }
  el.innerHTML = `<p>Tidak ditemukan nomor pengiriman ${no}.</p>`;
}

function buildTrackingHtmlFromOrder(found){
  return `
    <h3>${found.deliveryNumber}</h3>
    <p>Nama: ${found.name}</p>
    <p>Alamat: ${found.address}</p>
    <p>Status: <strong>${found.status}</strong></p>
    <p>Total: Rp ${found.total.toLocaleString()}</p>
    <p>Ekspedisi: ${found.expedition.courier} | Tgl kirim: ${found.expedition.date} | Tipe: ${found.expedition.type}</p>
    <h4>Items:</h4>
    <ul>${found.items.map(i => `<li>${i.title} x ${i.qty} (Rp ${i.price.toLocaleString()})</li>`).join('')}</ul>
    <div style="margin-top:8px;">${renderProgressBar(found.status)}</div>
  `;
}

function renderProgressBar(status){
  let pct = 0;
  if(status === "Dikemas") pct = 33;
  else if(status === "Dikirim") pct = 66;
  else if(status === "Sampai" || status === "Selesai") pct = 100;
  return `<div style="border:1px solid #ccc;width:100%;background:#f7f7f7;padding:6px;">
    <div style="width:${pct}%;height:16px;background:#4CAF50;"></div>
    <small>${pct}%</small>
  </div>`;
}

// ---- On page load helpers ----
function initCommon(){
  window.onclick = function(e){
    const modals = document.querySelectorAll(".modal");
    modals.forEach(m => { if(e.target === m) m.style.display = "none"; });
  };
  if(!localStorage.getItem("katalog") && typeof dataKatalogBuku !== "undefined") {
    const katalogAwal = dataKatalogBuku.map(b => ({
      id: b.kodeBarang,
      title: b.namaBarang,
      author: b.jenisBarang,
      price: parseInt((b.harga||"").replace(/[^0-9]/g, "")) || 0,
      stock: b.stok || 0,
      img: b.cover || "assets/logo.png"
    }));
    localStorage.setItem("katalog", JSON.stringify(katalogAwal));
  }
}
//=======feed back moderen===================
function showToast(msg, color="#28a745"){
  const div = document.createElement("div");
  div.className = "toast";
  div.style.background = color;
  div.innerText = msg;
  document.body.appendChild(div);
  setTimeout(() => div.classList.add("show"), 10);
  setTimeout(() => div.remove(), 3000);
}

// === Notifikasi Toast ===
function showToast(msg, color = "#28a745") {
  const div = document.createElement("div");
  div.className = "toast";
  div.style.background = color;
  div.innerText = msg;
  document.body.appendChild(div);

  // animasi muncul
  setTimeout(() => div.classList.add("show"), 10);
  // hilang otomatis
  setTimeout(() => div.remove(), 3000);
}



// ---- Expose global ----
window.loginSubmit = loginSubmit;
window.logout = logout;
window.openModal = openModal;
window.closeModal = closeModal;
window.renderGreeting = renderGreeting;
window.renderDashboardStats = renderDashboardStats;
window.renderStockTable = renderStockTable;
window.addNewBook = addNewBook;
window.populateBookOptions = populateBookOptions;
window.addToCart = addToCart;
window.renderCart = renderCart;
window.placeOrder = placeOrder;
window.trackingSearch = trackingSearch;
window.initCommon = initCommon;
window.updateStock = updateStock;
window.deleteBook = deleteBook;
window.removeCart = removeCart;
