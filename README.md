# Markdown Lite

Markdown Lite is a lightweight local-first Markdown editor built with React, Vite, Rust, and Tauri 2. It focuses on fast startup, a clean split-view writing experience, and direct file system access without any cloud sync or database layer.

## Features

- Create a fresh untitled document with a single click.
- Open local `.md` and `.txt` files through the native system dialog.
- Save directly to the bound file path, or use a native save dialog for new documents.
- Edit Markdown in a monospace text area with an instant live preview.
- Support headings, emphasis, lists, code blocks, blockquotes, and links.
- Use `Ctrl + S` / `Cmd + S` to save and `Ctrl + O` / `Cmd + O` to open files.
- Track live word and character counts in the status bar.

## Tech Stack

- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- Markdown parser: `react-markdown` + `remark-gfm`
- Desktop shell: Tauri 2
- Backend file I/O: Rust `std::fs`

## Getting Started

### Prerequisites

- Node.js 18+
- Rust toolchain
- Tauri 2 system prerequisites for your platform

### Install dependencies

```bash
npm install
```

### Start the desktop app

```bash
npm run dev:desktop
```

### Create a production frontend build

```bash
npm run build
```

This command only builds the Vite frontend assets into `dist/`.

### Build the desktop application

```bash
npm run build:desktop
```

This command runs the Tauri production build.

## Project Structure

```text
.
├─ src/                 # React frontend
├─ src-tauri/           # Rust backend and Tauri configuration
├─ package.json
└─ README.md
```

## Notes

- The app stores documents directly on the local file system.
- There is no remote sync, hidden database, or account requirement.
- The toolbar always shows the active absolute file path or `Untitled` when no file is bound.
- Desktop installer bundling is currently disabled in `src-tauri/tauri.conf.json`, so the Tauri production build does not generate installer bundles by default.
