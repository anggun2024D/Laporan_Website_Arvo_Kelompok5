# 🌿 ARVO — Smart Planner & Growth Dashboard Mahasiswa MI

> ✨ *Sebuah website planner interaktif untuk membantu mahasiswa mengatur jadwal, mencatat notulensi, dan melacak perkembangan akademik.*

---

## 🧭 Deskripsi Proyek

**ARVO** adalah website berbasis **HTML, CSS, dan JavaScript** yang dikembangkan untuk memenuhi proyek **UTS Pemrograman Web**.  
Website ini dirancang sebagai **planner digital** yang membantu mahasiswa dalam:

- Menyusun jadwal kegiatan kuliah maupun organisasi 📅  
- Menyimpan hasil notulensi rapat 📝  
- Memantau progres akademik 🎯  
- Mengatur profil pribadi 👤  

Seluruh sistem dijalankan secara **client-side** tanpa server.  
Data pengguna, jadwal, dan catatan disimpan menggunakan **Local Storage** browser.

---

## 🎯 Tujuan Pengembangan

Website **ARVO** dikembangkan dengan tujuan untuk:

1. Membiasakan mahasiswa menggunakan *digital productivity tools*.
2. Menunjukkan penerapan **HTML5 semantik**, **CSS3 responsif**, dan **JavaScript interaktif**.
3. Menerapkan konsep penyimpanan data berbasis *localStorage* tanpa back-end.
4. Membangun tampilan website yang minimalis, interaktif, dan ramah pengguna.

---

## 👥 Target Pengguna

🎓 **Mahasiswa Manajemen Informatika (MI)**  
Website ini ditujukan bagi mahasiswa yang ingin mengatur aktivitas akademik dan organisasi secara efisien, sambil memantau perkembangan diri dan produktivitasnya.

---

## 🗂️ Struktur Proyek

Semua file inti dikelola secara modular agar mudah dipahami dan dikembangkan kembali.

📁 Arvo/

├── index.html → Struktur utama halaman web

├── style.css → File desain dan tata letak responsif

├── script.js → Logika interaksi dan DOM manipulation

└── database.js → Modul penyimpanan data (localStorage)



---

## 🧱 Struktur HTML

Website ini hanya memiliki satu file HTML utama, `index.html`, yang berisi beberapa **section** terpisah untuk setiap fitur:
- Dashboard
- Jadwal
- Notulensi
- Profil Pengguna

Semua section diatur menggunakan tag semantik:

```html
<header> ... </header>
<nav> ... </nav>
<main> ... </main>
<footer> ... </footer>
```
Navigasi antarhalaman diatur menggunakan data attribute dan JavaScript toggle, bukan pindah halaman baru.
Setiap form juga sudah memiliki atribut validasi seperti required untuk memastikan input tidak kosong sebelum dikirim.

---

## 🎨 Desain CSS

Tampilan website ARVO dibuat sederhana, bersih, dan responsif dengan prinsip berikut:

- Flexbox → digunakan untuk navigasi dan tata letak header/footer
- CSS Grid → digunakan pada dashboard dan halaman jadwal
- Media Query → memastikan tampilan tetap rapi di mobile
- Warna pastel lembut → kombinasi biru muda #CDE3EB dan peach #F9D9CA
- Font modern → Poppins dan Inter
- Efek interaktif → hover, shadow, dan transisi lembut

Contoh penerapan tombol gradasi dengan efek hover:
```html
.btn {
  background: linear-gradient(135deg, #CDE3EB, #F9D9CA);
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}
```
Contoh penerapan layout responsif menggunakan Grid dan Media Query:
```html
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

```

---

## ⚙️ Logika JavaScript

Semua interaksi pengguna diatur menggunakan JavaScript murni dalam file script.js, sementara penyimpanan data dikelola melalui database.js.

🔧 Fitur Utama:

1. Event handling untuk tombol “Simpan Jadwal”, “Simpan Notulensi”, “Ubah Profil”, dll.
2. Manipulasi DOM (menambahkan elemen baru ke halaman tanpa reload).
3. Form validation sebelum data disimpan.
4. Penyimpanan data menggunakan localStorage.
5. Notifikasi otomatis untuk kegiatan di hari ini.

Contoh event handler untuk menyimpan jadwal baru:
```html
document.querySelector('#saveSchedule').addEventListener('click', () => {
  const title = document.querySelector('#title').value;
  const date = document.querySelector('#date').value;

  if (!title || !date) {
    alert('Harap isi semua kolom!');
    return;
  }

  const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
  schedules.push({ title, date });
  localStorage.setItem('schedules', JSON.stringify(schedules));

  alert('Jadwal berhasil disimpan!');
});

```

Dan contoh penyimpanan serta pengambilan data pengguna pada database.js:

```html
// Simpan data pengguna
function saveUser(user) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
}

// Ambil data pengguna berdasarkan username
function getUser(username) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  return users.find((u) => u.username === username);
}
```

---

## 🧩 Fungsionalitas Utama

| Fitur                 | Deskripsi                                         |
| --------------------- | ------------------------------------------------- |
| 🏠 **Dashboard**      | Menampilkan aktivitas harian dan progress         |
| 📅 **Jadwal**         | Tambah kegiatan dan tampilkan notifikasi otomatis |
| 📝 **Notulensi**      | Simpan dan cari catatan rapat                     |
| 👤 **Profil**         | Lihat dan perbarui data pengguna                  |
| 🔐 **Login/Register** | Sistem autentikasi berbasis localStorage          |

---

## 📘 Software Requirement Specification (SRS)

🔹 Ruang Lingkup

Sistem ARVO mencakup fitur:

- Login & registrasi pengguna
- Tambah jadwal & notulensi
- Tampilkan kegiatan hari ini
- Penyimpanan data di localStorage

🔹 Kebutuhan Fungsional

| Kode | Deskripsi                                       |
| ---- | ----------------------------------------------- |
| F1   | Pengguna dapat login dan register akun baru     |
| F2   | Pengguna dapat menambah dan menghapus jadwal    |
| F3   | Sistem menampilkan notifikasi kegiatan hari ini |
| F4   | Pengguna dapat menulis & mencari notulensi      |
| F5   | Pengguna dapat memperbarui data profil          |

🔹 Kebutuhan Non-Fungsional

- Website berjalan sepenuhnya di sisi klien (tanpa server).
- Desain responsif dan ringan diakses.
- Waktu muat halaman cepat (< 1 detik di local host).
- Konsistensi warna & tipografi di seluruh halaman.

---

## 🧠 Teknologi yang Digunakan

| Kategori    | Teknologi                                    |
| ----------- | -------------------------------------------- |
| Struktur    | HTML5                                        |
| Desain      | CSS3 (Flexbox, Grid, Media Query)            |
| Interaksi   | JavaScript (DOM, Event Handling, Validation) |
| Penyimpanan | localStorage (melalui database.js)           |
| Editor      | Visual Studio Code + Live Server             |

---

## 👨‍💻 Tim Pengembang

| Nama                      | Peran                                |
| ------------------------- | ------------------------------------ |
| [Muhammad Ibnu Tsalits]   | Front-End Developer                  |
| [Agnesia Hega Putri]      | UI/UX & CSS Designer                 |
| [Anggun Amaylia Abdillah] | JavaScript Developer & Documentation |

---


---

## 📜 Cara Menjalankan Website

Proyek ini dibuat untuk tujuan edukasi dalam rangka UTS Pemrograman Web

Akses website di link berikut https://anggun2024d.github.io/arvo.website.com/


### © 2025 — Arvo Project Team.
