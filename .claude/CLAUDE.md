# AI Docs Editor

A local markdown editor with live preview and DOCX export, designed for AI-assisted document editing.

## Project Overview

This tool lets you edit markdown files using AI coding assistants (Claude, Cursor, etc.) while previewing changes in real-time in your browser. Export to Word documents with consistent formatting.

## Architecture

```
ai-docs-editor/
├── server/                 # Fastify backend (port 3005)
│   ├── index.js           # Server entry, spawns Vite
│   ├── websocket.js       # File watcher + WebSocket broadcast
│   └── routes/
│       ├── files.js       # GET /api/files, GET /api/files/:name
│       └── export.js      # POST /api/export/:name (Pandoc conversion)
├── src/                    # React frontend (Vite, port 5173)
│   ├── App.jsx            # Main app with file switching
│   ├── index.css          # Tailwind v4 + GitHub markdown styles
│   ├── main.jsx           # React entry
│   └── components/
│       ├── DocumentSwitcher.jsx  # File dropdown
│       ├── Preview.jsx           # react-markdown with GFM + syntax highlighting
│       └── ExportButton.jsx      # DOCX export trigger
├── docs/                   # Markdown files to edit (watched)
├── exports/                # Temporary DOCX output (auto-cleaned)
└── reference.docx          # Pandoc style template
```

## Tech Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS v4
- **Backend**: Fastify 5 with WebSocket support
- **Markdown**: react-markdown, remark-gfm, rehype-highlight
- **Export**: Pandoc with custom reference.docx template
- **File Watching**: chokidar

## Key Features

1. **Live Preview**: WebSocket connection watches `docs/*.md` and pushes changes to browser instantly
2. **GitHub Styling**: Markdown preview matches GitHub's rendering style
3. **DOCX Export**: Uses Pandoc with `-f markdown-auto_identifiers` to disable bookmark icons
4. **Custom Styles**: `reference.docx` defines fonts (Arial), table borders, and heading colors (black)

## Development

```bash
pnpm install
pnpm dev          # Starts both Fastify (3005) and Vite (5173)
```

Open http://localhost:5173 to view the editor.

## Export Configuration

The `reference.docx` file controls Word document styling:
- **Fonts**: Arial (set via theme in `word/theme/theme1.xml`)
- **Headings**: Black text (#000000), not blue
- **Tables**: Black borders on all sides
- **Bookmark Icons**: Disabled via `-f markdown-auto_identifiers` flag

To modify styles, extract the docx, edit `word/styles.xml`, and repackage:
```bash
cd /tmp && mkdir docx-ref && cd docx-ref
unzip /path/to/reference.docx
# Edit word/styles.xml
zip -r reference.docx .
cp reference.docx /path/to/project/
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files` | List all `.md` files in `docs/` |
| GET | `/api/files/:name` | Get content of a specific file |
| POST | `/api/export/:name` | Convert markdown to DOCX, returns file |
| WS | `/ws` | WebSocket for file change notifications |

## Requirements

- Node.js 18+
- Pandoc (`brew install pandoc` on macOS)
