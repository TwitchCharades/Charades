// IPC Events
export const IPC_EVENTS = {
    // Application Window
    WINDOW_ACTION: 'window-action',
    HEALTH_STATUS: 'health-status',
} as const;

export type IpcEvent = typeof IPC_EVENTS[keyof typeof IPC_EVENTS];