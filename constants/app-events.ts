// APP Events
export const APP_EVENTS = {
    // Application Lifecycle
    WINDOWS_ALL_CLOSED: 'window-all-closed',
    ACTIVATE: 'activate',

    // Electron webContents Events
    CRASHED: 'web-contents-crashed',
    DID_FINISH_LOAD: 'did-finish-load',

    // message channel
    MAIN_PROCESS_MESSAGE: 'main-process-message',
} as const;

export type AppEvent = typeof APP_EVENTS[keyof typeof APP_EVENTS];