import { IpcMainInvokeEvent, ipcMain } from 'electron'
import * as JournalClient from '../api/journal-client'

export function setupDevHandlers() {
  ipcMain.handle('reset-database', async (_: IpcMainInvokeEvent): Promise<void> => {
    await JournalClient.resetDatabase()
  })
}
