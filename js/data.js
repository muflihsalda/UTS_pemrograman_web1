/* data.js - data dummy sesuai soal UTS (Array JSON) */

/* pengguna */
var users = [
  { id: 1, name: "Rina Wulandari", email: "rina@gmail.com", password: "rina123", role: "User" },
  { id: 2, name: "Agus Pranoto", email: "agus@gmail.com", password: "agus123", role: "User" },
  { id: 3, name: "Siti Marlina", email: "siti@gmail.com", password: "siti123", role: "Admin" }
];

/* katalog buku - sebagai sumber awal (sesuai soal: array JSON) */
var dataKatalogBuku = [
    {
        kodeBarang: "ASIP4301",
        namaBarang: "Pengantar Ilmu Komunikasi",
        jenisBarang: "Buku Ajar",
        edisi: "2",
        stok: 548,
        harga: "Rp 180.000",
        cover: "img/pengantar_komunikasi.jpg"
    },
    {
        kodeBarang: "EKMA4002",
        namaBarang: "Manajemen Keuangan",
        jenisBarang: "Buku Ajar",
        edisi: "3",
        stok: 392,
        harga: "Rp 220.000",
        cover: "img/manajemen_keuangan.jpg"
    },
    {
        kodeBarang: "EKMA4310",
        namaBarang: "Kepemimpinan",
        jenisBarang: "Buku Ajar",
        edisi: "1",
        stok: 278,
        harga: "Rp 150.000",
        cover: "img/kepemimpinan.jpg"
    },
    {
        kodeBarang: "BIOL4211",
        namaBarang: "Mikrobiologi Dasar",
        jenisBarang: "Buku Ajar",
        edisi: "2",
        stok: 165,
        harga: "Rp 200.000",
        cover: "img/mikrobiologi.jpg"
    },
    {
        kodeBarang: "PAUD4401",
        namaBarang: "Perkembangan Anak Usia Dini",
        jenisBarang: "Buku Ajar",
        edisi: "4",
        stok: 204,
        harga: "Rp 250.000",
        cover: "img/paud_perkembangan.jpg"
    }
]

/* data tracking contoh (opsional) */
var dataTracking = {
  "20230012": {
    nomorDO: "20230012",
    nama: "Rina Wulandari",
    status: "Dalam Perjalanan",
    ekspedisi: "JNE",
    tanggalKirim: "2025-08-25",
    paket: "0JKT01",
    total: "Rp 180.000",
    perjalanan:[
      { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka" },
      { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: TANGERANG SELATAN" },
      { waktu: "2025-08-25 18:00:00", keterangan: "Diteruskan ke Kantor Jakarta Selatan" }
    ]
  },
  "20230013": {
    nomorDO: "20230013",
    nama: "Agus Pranoto",
    status: "Dikirim",
    ekspedisi: "Pos Indonesia",
    tanggalKirim: "2025-08-25",
    paket: "0UPBJJBDG",
    total: "Rp 220.000",
    perjalanan:[
      { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka" },
      { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: TANGERANG SELATAN" },
      { waktu: "2025-08-26 20:00:00", keterangan: "Selesai Antar. Penerima: Agus Pranoto" }
    ]
  }
};

/* inisialisasi katalog ke localStorage jika belum ada
   -> mapping ke format yang dipakai script.js (id,title,author,price,stock,img)
*/
if (!localStorage.getItem("katalog")) {
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

/* inisialisasi orders jika belum ada */
if (!localStorage.getItem("orders")) {
  localStorage.setItem("orders", JSON.stringify([]));
}
