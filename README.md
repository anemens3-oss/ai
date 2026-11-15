# SITECRAFT — Design once. Build instantly.

**SITECRAFT** is an intelligent visual web design and AI code-compilation platform. Users create and customize multi-page responsive layouts on an interactive Figma-style canvas and compile their structured design JSON into production-ready HTML, CSS, JavaScript, and React code with live sandboxed preview and full ZIP project export.

---

## Core Workflow

1. **Create Project** — Start from a blank canvas or choose from 6 industry-grade templates (*Modern Business*, *Creative Portfolio*, *SaaS Landing*, *Restaurant*, *Auto Service*, *E-commerce*).
2. **Design Visually** — Manipulate layers, pages, reusable components, flexbox/grid layouts, typography, spacing, borders, shadows, and responsive breakpoints (*Desktop 1440px*, *Tablet 768px*, *Mobile 390px*) on an interactive canvas with drag-and-drop, resize handles, snap guides, multi-select, and full Undo/Redo history.
3. **AI Assistant** — Select any element on the canvas and run natural-language design transformations (e.g., *"Make this section more modern"*, *"Change the background to dark"*, *"Improve spacing"*, *"Make this block responsive"*) with diff preview, Accept/Reject controls, and change history.
4. **Compile Website (`Generate Website`)** — Transforms the structured JSON document model into clean semantic HTML5, responsive CSS3, interactive JavaScript, and a modular React component via the backend compilation pipeline.
5. **Live Preview & Code Inspector** — Test the compiled site in an isolated iframe across Desktop, Tablet, and Mobile viewports, reload state, or inspect the generated source files.
6. **Export ZIP** — Download a complete, standalone `.zip` archive containing `index.html`, `styles.css`, `script.js`, `src/App.tsx`, `design-document.json`, and launch documentation.

---

## Running Locally

### Prerequisites
- Node.js 18+ (or Bun)
- npm

### Installation & Launch
```bash
# 1. Install dependencies
npm install

# 2. Copy environment configuration
cp .env.example .env

# 3. Start full-stack server (Express API + Vite frontend on port 3000)
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Environment Variables & AI Engine Modes

Configure variables in `.env` (see `.env.example`):

| Variable | Description | Required? |
| :--- | :--- | :--- |
| `DEEPSEEK_API_KEY` | Secret API key from [DeepSeek Platform](https://platform.deepseek.com) for cloud AI code compilation and assistant modifications. | Optional |
| `DEEPSEEK_API_URL` | DeepSeek chat completions endpoint (`https://api.deepseek.com/v1/chat/completions`). | Optional |
| `DEEPSEEK_MODEL` | DeepSeek model identifier (default: `deepseek-chat`). | Optional |
| `GEMINI_API_KEY` | Optional Google Gemini API key for server-side fallback compilation. | Optional |

### Features Working Out-of-the-Box (No API Key Required)
When `DEEPSEEK_API_KEY` is not set, SITECRAFT transparently reports that the cloud DeepSeek API is not connected and automatically uses its **Built-in Deterministic Compiler & Local AST Transformation Engine**:
- Full visual canvas editor, layers, pages, components, and 6 templates
- Local persistence via IndexedDB & `localStorage`
- Contextual AI Assistant element transformations with diff preview and Accept/Reject
- Full responsive HTML5 / CSS3 / JS / React compilation preserving exact coordinates, flex/grid rules, colors, typography, and assets
- Live sandboxed preview and full `.zip` archive export

---

## Production Build & Verification

```bash
# Run unit tests for core design engine & code compiler
npx --yes tsx --test src/utils/designEngine.test.ts

# Type-check TypeScript
npm run lint

# Build production bundle
npm run build

# Start production server
npm start
```
