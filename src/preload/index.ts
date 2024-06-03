import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Api } from '@shared/types'

const api: Api = {
  getTask: (taskId) => ipcRenderer.invoke('get-task', taskId),
  getTaskByCollectionId: (taskId, collectionId) =>
    ipcRenderer.invoke('get-task-by-collection-id', taskId, collectionId),
  getTasksByCollectionId: (collectionId) =>
    ipcRenderer.invoke('get-tasks-by-collection-id', collectionId),
  getTasksByCollection: (collectionData) =>
    ipcRenderer.invoke('get-tasks-by-collection', collectionData),
  addTask: (taskData) => ipcRenderer.invoke('add-task', taskData),
  deleteTask: (taskId) => ipcRenderer.invoke('delete-task', taskId),
  cancelTask: (taskId) => ipcRenderer.invoke('cancel-task', taskId),
  getEvent: (eventId) => ipcRenderer.invoke('get-event', eventId),
  getEventByCollectionId: (eventId, collectionId) =>
    ipcRenderer.invoke('get-event-by-collection-id', eventId, collectionId),
  getEventsByCollectionId: (collectionId) =>
    ipcRenderer.invoke('get-events-by-collection-id', collectionId),
  getEventsByCollection: (collectionData) =>
    ipcRenderer.invoke('get-events-by-collection', collectionData),
  addEvent: (eventData) => ipcRenderer.invoke('add-event', eventData),
  deleteEvent: (eventId) => ipcRenderer.invoke('delete-event', eventId),
  cancelEvent: (eventId) => ipcRenderer.invoke('cancel-event', eventId),
  getCollection: (collectinId) => ipcRenderer.invoke('get-collection', collectinId),
  getCollections: () => ipcRenderer.invoke('get-collections'),
  addCollection: (collectionData) => ipcRenderer.invoke('add-collection', collectionData),
  deleteColection: (collectionId) => ipcRenderer.invoke('delete-collection', collectionId)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
