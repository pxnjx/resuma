# Lanjut — Free, Local-First ATS Resume Builder

**Land The Interview, Not The Reject Pile.** Lanjut adalah resume builder ATS (Applicant Tracking System) yang *local-first*: seluruh data tersimpan di browser Anda (localStorage), tanpa akun, tanpa upload ke server.

Dibangun ulang dari prototype single-file `ats.html` menggunakan **React 18 + Vite** (JavaScript/JSX), tanpa dependency runtime tambahan.

## ✨ Fitur

- **Landing page** — hero, 6 feature cards, 3 langkah "How it works", gallery template dengan mini preview *live*
- **Fine-grained editor** — 8 tab: Profile, Experience, Education, Projects, Certificates, Languages, Skills (flat & grouped), Summary
- **Drag & drop reorder** — susun ulang urutan entri lewat handle ⠿ di tiap kartu
- **Accent color picker** — warna aksen kustom untuk judul section & skill chips (ikut ter-export ke PDF/DOCX/HTML via inline style)
- **Real-time preview** — kertas resume ter-update saat mengetik
- **3 template** — Modern, Classic, Minimal (hanya mengubah tipografi/spacing/aksen; struktur ATS-safe tetap)
- **5 format export** — `.TXT`, `.PDF`, `.DOCX`, `.HTML`, `.JSON` (semua dependency-free)
- **Import JSON** — pindahkan data antar browser/perangkat
- **ATS Readback** — simulasi apa yang dibaca parser ATS, urutan baca tetap utuh
- **ATS Readiness meter** — checklist kelengkapan 8 bagian esensial resume
- **Auto-save** — setiap perubahan tersimpan otomatis ke localStorage
- **Sample resume** — terisi otomatis pada kunjungan pertama; tombol ✨ Load Sample untuk memuat ulang

## 🗺 Halaman (Hash Routing)

Router hash buatan sendiri (`src/router.jsx`) — tanpa dependency, aman untuk static hosting. Route yang tersedia:

| Route | Halaman |
|---|---|
| `#/` | **Landing** — marketing page; klik kartu template → langsung buat resume & masuk builder |
| `#/dashboard` | **Dashboard** — statistik + kartu "My Resume" (Edit / Duplicate / Delete) + New Resume |
| `#/templates` | **Browse Template** — pilih template → langsung buat resume baru |
| `#/builder/:id` | **Builder** — editor + preview untuk satu resume (judul bisa di-rename di top bar) |

Resume kini tersimpan sebagai **library multi-resume** di `localStorage` (key `lanjut_resume_library_v1`). Data lama dari key `lanjut_resume_state` dimigrasikan otomatis saat pertama kali dibuka. Sidebar platform mengikuti struktur `/platform` Lanjut: **Platform** (Dashboard, Browse Template), **My Resume** (daftar resume), **Other** (Home, Reset All Data).

## 🚀 Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173 (otomatis pindah port jika dipakai)
npm run build    # output ke dist/
npm run preview  # pratinjau hasil build production
npm test         # unit test (Vitest) untuk generator teks & ATS readback
npm run test:watch
```

## 📁 Struktur Proyek

```
src/
├── main.jsx                    # Entry point React
├── App.jsx                     # Komposisi halaman + state global + toast
├── data/
│   └── sampleResume.js         # Data contoh (kunjungan pertama)
├── hooks/
│   └── useResumeState.js       # State + autosave localStorage + actions (add/update/remove/move)
├── utils/
│   ├── exporters.js            # TXT/PDF/DOCX/HTML/JSON (dependency-free)
│   ├── text.js                 # Generator plain text + ATS readback
│   ├── text.test.js            # Unit test (Vitest)
│   └── color.js                # Helper tint warna aksen
├── styles/
│   ├── global.css              # Tema gelap: landing + builder + editor
│   └── resume-templates.css    # Kertas resume: tpl-modern/classic/minimal + print
└── components/
    ├── landing/                # Nav, Hero, Features, HowItWorks, TemplateGallery, Footer
    └── builder/                # Builder, EditorTabs, tab panels, EntryCard (drag & drop),
                                # ResumePaper, ResumePreview, AtsReadback, AtsChecklist, Toast
```

## 💾 Format Data (JSON)

State tersimpan di `localStorage` dengan key `lanjut_resume_state`:

```json
{
  "name": "...", "title": "...", "email": "...", "phone": "...",
  "location": "...", "linkedin": "...", "summary": "...",
  "skills": "A, B, C", "skillsGrouped": "Frontend: React, Vue",
  "experience": [{ "title": "", "company": "", "start": "", "end": "", "desc": "" }],
  "education": [{ "degree": "", "school": "", "start": "", "end": "", "desc": "" }],
  "projects": [{ "name": "", "link": "", "desc": "" }],
  "certifications": [{ "name": "", "issuer": "", "year": "" }],
  "languages": [{ "name": "", "level": "" }],
  "template": "modern",
  "accent": "#7c5cfc"
}
```

`Export JSON` menghasilkan format yang sama — field lama (tanpa projects/certifications/languages/accent) tetap bisa di-import.

## 🖨 Catatan Export

- **PDF** — membuka print window dengan CSS template identik; pilih *"Save as PDF"*
- **DOCX** — file Word-compatible HTML (`.doc`); membuka baik di Microsoft Word maupun LibreOffice
- **HTML** — file HTML mandiri; CSS print bawaan membuat `Ctrl+P` hanya mencetak kertas resume
- **TXT** — plain text dengan header bagian; paling aman dibaca parser ATS

Warna aksen diterapkan lewat *inline style* (bukan CSS variable) agar ikut terbawa ke PDF, DOCX, dan HTML.

## 🌍 Deploy

Build bersifat portabel (`base: './'`), jadi `dist/` bisa di-host di mana saja:

- **Netlify / Vercel** — drag & drop folder `dist/`, atau hubungkan repo (build command `npm run build`, publish dir `dist`)
- **GitHub Pages** — deploy isi `dist/` ke branch `gh-pages`
- **File system** — karena base relatif, `dist/index.html` bahkan bisa dibuka langsung dari disk

Contoh workflow GitHub Actions (`.github/workflows/deploy.yml`):

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```
