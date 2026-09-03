# Resuma — Free, Local-First ATS Resume Builder

**Build ATS-friendly resumes in your browser.** Resuma is a local-first ATS (Applicant Tracking System) resume builder: all data stays in your browser (localStorage), no account, no uploads to any server.

Built from scratch with **React 18 + Vite** (JavaScript/JSX), zero runtime dependencies.

## ✨ Features

- **Landing page** — hero, feature cards, 3-step "How it works", template gallery with live mini preview — click a template card to start building
- **Structured editor** — 8 tabs: Profile, Experience, Education, Projects, Certificates, Languages, Skills (flat & grouped), Summary
- **Drag & drop reorder** — rearrange entries via ⠿ handle on each card
- **Move up/down buttons** — arrow buttons on each entry for easy reordering on mobile
- **Accent color picker** — custom accent color for section headings & skill chips (exported to PDF/DOCX/HTML)
- **Font selector** — 9 open-source font families (Inter, Poppins, Roboto, Open Sans, Lato, Source Sans 3, IBM Plex Sans, Merriweather, Lora)
- **Real-time preview** — resume paper updates as you type
- **Full preview modal** — click the preview thumbnail to view the full resume
- **3 templates** — Modern, Classic, Minimal (typography/spacing/accent only; ATS-safe structure preserved)
- **6 export formats** — `.TXT`, `.PDF` (native PDF), `.DOCX` (Office Open XML), `.MD`, `.HTML`, `.JSON` (all dependency-free)
- **Import JSON** — transfer data between browsers/devices
- **ATS Readback** — simulate what an ATS parser reads, reading order preserved
- **ATS Readiness meter** — checklist for 8 essential resume sections
- **Auto-save** — every change saved automatically to localStorage
- **Multi-resume library** — store multiple resumes, manage from Dashboard
- **Responsive design** — mobile-friendly with collapsible sidebar drawer, scrollable tabs, and touch-optimized ribbon interface
- **SEO optimized** — Open Graph, Twitter Cards, Schema.org structured data, favicon

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

## 💾 Data Format (JSON)

Resumes stored as **multi-resume library** in `localStorage` with key `resuma_resume_library_v1`:

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
        "accent": "#7c5cfc",
        "font": "inter"
      }
    }
  ]
}
```

`Export JSON` produces per-document data and can be imported into any resume. Legacy keys are **auto-migrated** on first load.

## 🖨 Export Notes

- **PDF** — converted directly to native PDF by internal generator (`pdf.js`, dependency-free): no print dialog, no browser timestamp/header, identical output every time
- **DOCX** — genuine Office Open XML (ZIP package with WordprocessingML, built dependency-free via `zip.js` + `docx.js`); opens in Microsoft Word, LibreOffice, Google Docs without format warnings, ATS-parser friendly
- **MD** — Markdown with `#`/`##`/`###` headings, italic dates, `- ` bullets; ideal for README, portfolio, or LLM-friendly output
- **HTML** — standalone file; built-in print CSS makes `Ctrl+P` print only the resume paper
- **TXT** — plain text with section headers; safest for ATS parsers

Accent color applied via inline style (HTML), `w:color` WordprocessingML (DOCX), and native fill/stroke (PDF). Font family applied to all export formats.

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
