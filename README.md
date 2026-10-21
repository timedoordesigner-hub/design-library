# Design Library

Next.js 16 + Supabase. Jalankan: `npm run dev`.

## Mau ubah apa? Buka file ini

| Yang diubah | File |
|---|---|
| Menu sidebar, tombol Request Wave, Login | `components/Sidebar.tsx` |
| Judul halaman di atas | `components/Topbar.tsx` |
| Halaman cari (beranda) | `components/SearchHome.tsx` |
| Halaman Design Library (grid + hover info) | `components/Gallery.tsx` |
| Tabel/grid admin, filter, hapus | `components/Library.tsx` |
| Popup detail design + design serupa | `components/Viewer.tsx`, `lib/similar.ts` |
| Form tambah/edit design (No otomatis) | `components/DesignForm.tsx` |
| Import JSON, hapus semua data | `components/ImportForm.tsx`, `lib/importSpreadsheet.ts` |
| Halaman login | `app/login/page.tsx` |
| Ikon | `components/Icons.tsx` |
| Akses database | `lib/store.ts` |
| Export Google Sheets -> JSON | `scripts/export-design-library.gs` |

## CSS: `app/globals.css` + `app/styles/`

`app/globals.css` hanya berisi warna (blok `:root`, ubah warna utama di sini) lalu meng-import file per area:

| Yang diubah | File CSS |
|---|---|
| Reset, toast, dialog hapus, notice, skeleton | `app/styles/base.css` |
| Sidebar, topbar, layout utama | `app/styles/shell.css` |
| Library admin: statistik, filter, tabel, grid kartu | `app/styles/library.css` |
| Thumbnail + popup viewer + design serupa | `app/styles/viewer.css` |
| Beranda cari + Design Library + **efek hover kartu** | `app/styles/gallery.css` |
| Halaman login | `app/styles/login.css` |
| Tombol, input, popup "i", form tambah/edit, import | `app/styles/forms.css` |
| Semua aturan mobile/tablet | `app/styles/responsive.css` |

Cara cari: lihat `className="..."` di file TSX, lalu Ctrl+Shift+F nama class itu di `app/styles`.
