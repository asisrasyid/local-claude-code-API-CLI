import Anthropic from '@anthropic-ai/sdk'

export const CLAUDE_TOOLS: Anthropic.Tool[] = [
  // ── SheetMaster ──────────────────────────────────────────────────────────
  {
    name: 'get_boards',
    description: 'Ambil semua board SheetMaster milik Muhammad Azis beserta deskripsinya',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_board_tasks',
    description: 'Ambil semua task dan kolom dari sebuah board SheetMaster',
    input_schema: {
      type: 'object',
      properties: { boardId: { type: 'string', description: 'ID board' } },
      required: ['boardId'],
    },
  },
  {
    name: 'create_task',
    description: 'Buat task baru di board SheetMaster',
    input_schema: {
      type: 'object',
      properties: {
        boardId: { type: 'string' },
        columnId: { type: 'string' },
        title: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        description: { type: 'string' },
      },
      required: ['boardId', 'columnId', 'title', 'priority'],
    },
  },
  {
    name: 'create_subtask',
    description: 'Tambahkan subtask/checklist ke sebuah task',
    input_schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string' },
        title: { type: 'string' },
      },
      required: ['taskId', 'title'],
    },
  },
  {
    name: 'update_context_file',
    description: 'Update isi file context seperti snap.md atau log.md dari chat',
    input_schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Nama file: snap.md, log.md, atau decisions.md' },
        content: { type: 'string', description: 'Konten baru file' },
      },
      required: ['filename', 'content'],
    },
  },

  // ── Filesystem ───────────────────────────────────────────────────────────
  {
    name: 'read_file',
    description: 'Baca isi file dari path manapun di mesin lokal',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path ke file, contoh: D:/project/api/src/index.ts' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Tulis/buat/update file di path manapun. Membuat parent directory jika belum ada.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path ke file' },
        content: { type: 'string', description: 'Konten file' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'list_directory',
    description: 'List isi direktori — file dan subfolder',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path ke direktori' },
      },
      required: ['path'],
    },
  },
  {
    name: 'create_directory',
    description: 'Buat direktori baru (recursive)',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path direktori yang ingin dibuat' },
      },
      required: ['path'],
    },
  },
  {
    name: 'run_bash',
    description: 'Jalankan perintah shell/bash. Bisa dipakai untuk npm install, git, build, test, dll.',
    input_schema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Perintah yang ingin dijalankan' },
        cwd: { type: 'string', description: 'Working directory (opsional). Default: project chatbot.' },
      },
      required: ['command'],
    },
  },
]
