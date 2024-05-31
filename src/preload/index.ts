import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getTask: (taskId) => ipcRenderer.invoke('get-task', taskId),
  getTaskByCollection: (taskId, collectionId) =>
    ipcRenderer.invoke('get-task-by-collection', taskId, collectionId),
  getTasksByCollection: (collectionId) =>
    ipcRenderer.invoke('get-tasks-by-collection', collectionId),
  addTask: (taskData) => ipcRenderer.invoke('add-task', taskData),
  deleteTask: (taskId) => ipcRenderer.invoke('delete-task', taskId),
  getEvent: (eventId) => ipcRenderer.invoke('get-event', eventId),
  getEventByCollection: (eventId, collectionId) =>
    ipcRenderer.invoke('get-event-by-collection', eventId, collectionId),
  getEventsByCollection: (collectionId) =>
    ipcRenderer.invoke('get-events-by-collection', collectionId),
  addEvent: (eventData) => ipcRenderer.invoke('add-event', eventData),
  deleteEvent: (eventId) => ipcRenderer.invoke('delete-event', eventId),
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
