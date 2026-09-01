# Resuma — Free, Local-First ATS Resume Builder

**Land The Interview, Not The Reject Pile.** Resuma adalah resume builder ATS (Applicant Tracking System) yang *local-first*: seluruh data tersimpan di browser Anda (localStorage), tanpa akun, tanpa upload ke server.

Dibangun ulang dari prototype single-file `ats.html` (terinspirasi oleh [lanjut.rimzzlabs.com](https://lanjut.rimzzlabs.com/)) menggunakan **React 18 + Vite** (JavaScript/JSX), tanpa dependency runtime tambahan.

## ✨ Fitur

- **Landing page** — hero, 6 feature cards, 3 langkah "How it works", gallery template dengan mini preview *live* — klik kartu template → langsung buat resume & masuk builder
- **Fine-grained editor** — 8 tab: Profile, Experience, Education, Projects, Certificates, Languages, Skills (flat & grouped), Summary
- **Drag & drop reorder** — susun ulang urutan entri lewat handle ⠿ di tiap kartu
- **Accent color picker** — warna aksen kustom untuk judul section & skill chips (ikut ter-export ke PDF/DOCX/HTML via inline style / WordprocessingML)
- **Real-time preview** — kertas resume ter-update saat mengetik
- **3 template** — Modern, Classic, Minimal (hanya mengubah tipografi/spacing/aksen; struktur ATS-safe tetap)
- **6 format export** — `.TXT`, `.PDF`, `.DOCX` (Office Open XML asli), `.MD`, `.HTML`, `.JSON` (semua dependency-free)
- **Import JSON** — pindahkan data antar browser/perangkat
- **ATS Readback** — simulasi apa yang dibaca parser ATS, urutan baca tetap utuh
- **ATS Readiness meter** — checklist kelengkapan 8 bagian esensial resume
- **Auto-save** — setiap perubahan tersimpan otomatis ke localStorage
- **Multi-resume library** — simpan banyak resume, kelola dari Dashboard

## 🗺 Halaman (Hash Routing)

Router hash buatan sendiri (`src/router.jsx`) — tanpa dependency, aman untuk static hosting. Route yang tersedia:

| Route | Halaman |
|---|---|
| `#/` | **Landing** — marketing page; klik kartu template → langsung buat resume & masuk builder |
| `#/dashboard` | **Dashboard** — statistik + kartu "My Resume" (Edit / Duplicate / Delete) + New Resume |
| `#/templates` | **Browse Template** — pilih template → langsung buat resume baru |
| `#/builder/:id` | **Builder** — editor + preview untuk satu resume (judul bisa di-rename di top bar) |

Sidebar platform mengikuti struktur `/platform` asli: **Platform** (Dashboard, Browse Template), **My Resume** (daftar resume), **Other** (Home, Reset All Data).

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
├── App.jsx                     # Hash router + library + halaman
├── router.jsx                  # Mini hash router (useHashRoute, navigate, Link)
├── data/
│   ├── schema.js               # Skema data resume + normalisasi
│   └── sampleResume.js         # Data contoh (kunjungan pertama)
├── hooks/
│   ├── useResumeLibrary.js     # Library multi-resume + autosave localStorage
│   └── useResumeEditor.js      # State editing per-resume (API action lengkap)
├── utils/
│   ├── exporters.js            # TXT/PDF/DOCX/HTML/MD/JSON (dependency-free)
│   ├── zip.js                  # ZIP writer minimal (CRC-32, store) untuk .docx
│   ├── docx.js                 # Builder Office Open XML (WordprocessingML)
│   ├── pdf.js                  # Generator PDF langsung (Helvetica + WinAnsi)
│   ├── markdown.js             # Generator Markdown export (.md)
│   ├── text.js                 # Generator plain text + ATS readback
│   ├── text.test.js            # Unit test (Vitest)
│   └── color.js                # Helper tint warna aksen
├── styles/
│   ├── global.css              # Tema gelap: landing + platform + builder
│   └── resume-templates.css    # Kertas resume: tpl-modern/classic/minimal + print
└── components/
    ├── landing/                # Landing, Nav, Hero, Features, HowItWorks, TemplateGallery, Footer
    ├── platform/               # PlatformLayout (sidebar), Dashboard, TemplatesPage
    └── builder/                # BuilderPage, EditorTabs, tab panels, EntryCard (drag & drop),
                                # ResumePaper, ResumePreview, AtsReadback, AtsChecklist, Toast
```

## 💾 Format Data (JSON)

Resume tersimpan sebagai **library multi-resume** di `localStorage` dengan key `resuma_resume_library_v1`:

```json
{
  "resumes": [
    {
      "id": "abc123",
      "title": "Software Engineer — 2026",
      "createdAt": 1700000000000,
      "updatedAt": 1700000100000,
      "data": {
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
    }
  ]
}
```

`Export JSON` menghasilkan data resume per-dokumen (isi field `data` di atas) dan tetap bisa di-import ke resume mana pun. Key lama (`lanjut_resume_library_v1` dan `lanjut_resume_state`) **dimigrasikan otomatis** saat pertama kali dibuka, lalu dibersihkan.

## 🖨 Catatan Export

- **PDF** — dikonversi langsung menjadi file PDF asli oleh generator internal (`pdf.js`, dependency-free): tanpa dialog print dan tanpa header/timestamp bawaan browser, hasilnya identik di setiap export
- **DOCX** — dokumen Office Open XML asli (paket ZIP berisi WordprocessingML, dibangun dependency-free lewat `zip.js` + `docx.js`); terbuka di Microsoft Word, LibreOffice, dan Google Docs tanpa peringatan format, dan mudah dibaca parser ATS
- **MD** — Markdown dengan heading `#`/`##`/`###`, tanggal italic, dan bullet `- `; pas untuk README, portofolio, atau LLM-friendly output
- **HTML** — file HTML mandiri; CSS print bawaan membuat `Ctrl+P` hanya mencetak kertas resume
- **TXT** — plain text dengan header bagian; paling aman dibaca parser ATS

Warna aksen diterapkan lewat *inline style* pada HTML, via `w:color` WordprocessingML pada DOCX, dan via warna fill/stroke native pada PDF.

## 🌍 Deploy

Build bersifat portabel (`base: './'`), jadi `dist/` bisa di-host di mana saja:

- **Netlify / Vercel** — drag & drop folder `dist/`, atau hubungkan repo (build command `npm run build`, publish dir `dist`)
- **GitHub Pages** — deploy isi `dist/` ke branch `gh-pages`
- **File system** — karena base relatif, `dist/index.html` bahkan bisa dibuka langsung dari disk

Contoh workflow GitHub Actions (`.github/workflows/deploy.yml`):

```yaml
name: Deploy
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v4
```
