# AI Docs Editor

A local markdown editor with live preview and DOCX export, designed for AI-assisted document editing.

Edit markdown files with your favorite AI coding assistant (Claude Code, Cursor, GitHub Copilot, etc.) and see changes instantly in your browser. Export to properly formatted Word documents when ready for upload to Google Docs or viewing in Word.

## Features

- **Live Preview**: Changes to markdown files appear instantly in the browser
- **GitHub-Style Rendering**: Markdown preview with tables, code highlighting, and GFM support
- **DOCX Export**: Convert to Word documents with consistent, professional formatting
- **Multi-Document Support**: Switch between multiple markdown files in the `docs/` folder
- **AI-Friendly**: Designed for editing with AI coding assistants

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Pandoc for DOCX export: `brew install pandoc`

### Installation

```bash
git clone <repo-url>
cd ai-docs-editor
pnpm install
```

### Usage

```bash
pnpm dev
```

This starts:
- Backend API on http://localhost:3005
- Frontend on http://localhost:5173

Open http://localhost:5173 in your browser, then edit files in the `docs/` folder with your AI tool. The preview updates automatically.

## How It Works

1. Place markdown files in the `docs/` folder
2. Open http://localhost:5173 to see the live preview
3. Edit files using your AI assistant or any text editor
4. Changes are detected via file watching and pushed to the browser via WebSocket
5. Click "Export to DOCX" to download a Word document

## Project Structure

```
ai-docs-editor/
├── docs/              # Your markdown files go here
├── server/            # Fastify backend with WebSocket
├── src/               # React frontend with Vite
├── reference.docx     # Word template for export styling
└── exports/           # Temporary export output (auto-cleaned)
```

## Export Styling

Exported DOCX files use `reference.docx` as a style template:
- **Font**: Arial throughout
- **Headings**: Black text (not blue)
- **Tables**: Clean black borders
- **No bookmark icons**: Headings export cleanly without anchor links

## Tech Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS v4
- **Backend**: Fastify 5 with WebSocket
- **Markdown**: react-markdown with remark-gfm and rehype-highlight
- **Export**: Pandoc

## License

ISC
