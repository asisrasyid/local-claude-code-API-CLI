const BASE_URL = process.env.SHEETMASTER_URL!
const API_KEY = process.env.SHEETMASTER_KEY!

async function smApi(action: string, params: Record<string, unknown> = {}) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ apiKey: API_KEY, action, ...params }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data.data
}

export const sm = {
  getBoards: () => smApi('getBoards'),
  getBoard: (boardId: string) => smApi('getBoard', { boardId }),
  createTask: (boardId: string, columnId: string, title: string, priority: string, description?: string) =>
    smApi('createTask', { boardId, columnId, title, priority, description }),
  updateTask: (taskId: string, fields: Record<string, unknown>) =>
    smApi('updateTask', { taskId, ...fields }),
  moveTask: (taskId: string, toColumnId: string, position: number) =>
    smApi('moveTask', { taskId, toColumnId, position }),
  createSubTask: (taskId: string, title: string) =>
    smApi('createSubTask', { taskId, title }),
}
