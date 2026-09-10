export const resetDatabase = async (): Promise<void> => {
  return window.devApi.resetDatabase()
}
