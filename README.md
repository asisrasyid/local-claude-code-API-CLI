# Local Claude Chat — Ruang Diskusi Muhammad Azis

Chat UI lokal berbasis Next.js yang auto-load context dari `context-task/ai/` dan terhubung ke Claude API + SheetMaster. Dijalankan di `localhost:3100` sebagai ruang diskusi personal.

## Quick Start

```bash
npm install
npm run dev
# Buka http://localhost:3100
```

## Requirements

- Node.js >= 18
- Anthropic API key dengan credit aktif

## Environment Variables

Buat file `.env.local` di root project:

```env
ANTHROPIC_API_KEY=sk-ant-xxxx
CONTEXT_DIR=../../updagrade-github/context-task/ai
SHEETMASTER_URL=https://script.google.com/macros/s/.../exec
SHEETMASTER_KEY=sm_xxxx
CLAUDE_BASH_PATH=C:\Users\nama\AppData\Local\Programs\Git\usr\bin\bash.exe
```

> `CLAUDE_BASH_PATH` diperlukan agar fallback Claude Code CLI bisa jalan di Windows.
> Cek path bash kamu dengan: `cygpath -w /usr/bin/bash`

## Struktur Project

```
src/
├── app/
│   ├── page.tsx              # Halaman utama + state management
│   ├── layout.tsx            # Root layout + font Jakarta Sans
│   ├── providers.tsx         # ThemeProvider (next-themes)
│   ├── globals.css           # CSS variables palette 4 warna
│   └── api/
│       ├── chat/route.ts     # POST — streaming SSE + tool use loop
│       └── context/route.ts  # GET — metadata context files
├── components/
│   ├── ChatWindow.tsx        # Scroll area + typing indicator
│   ├── MessageBubble.tsx     # Bubble user/assistant + markdown
│   ├── InputBar.tsx          # Textarea + kirim
│   ├── ContextPanel.tsx      # Sidebar context files
│   ├── ModeToggle.tsx        # Default / PM Agent switch
│   └── ThemeControl.tsx      # Light / System / Dark toggle
├── lib/
│   ├── context-loader.ts     # Baca context files dari disk
│   ├── system-prompt.ts      # Build system prompt + mode
│   ├── sheetmaster.ts        # Wrapper SheetMaster API
│   └── claude-tools.ts       # Tool definitions untuk Claude
└── types/index.ts            # TypeScript types
```

## Fitur

- **Context-aware**: Auto-load `rule_guide.md`, `snap.md`, `log.md`, `decisions.md` setiap sesi
- **Streaming**: Response muncul real-time token per token
- **Tool Use**: Claude bisa baca/tulis SheetMaster dan update context files langsung dari chat
- **PM Agent Mode**: Switch ke tone tegas + berbasis data untuk project review
- **Theme**: Light / System / Dark dengan palette fun & productive
- **Auto-refresh context**: Setiap 30 detik

## Stack

Next.js 16 · TypeScript · Tailwind CSS v4 · Framer Motion · next-themes · Anthropic SDK · Plus Jakarta Sans
