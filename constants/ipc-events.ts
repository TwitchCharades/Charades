// IPC Events
export const IPC_EVENTS = {
    // Application Window
    WINDOW_ACTION: "window-action",
    HEALTH_STATUS: "health-status",

    // Auto Updater
    UPDATE_AVAILABLE: "update-available",
    UPDATE_NOT_AVAILABLE: "update-not-available",
    UPDATE_ERROR: "update-error",
    UPDATE_DOWNLOAD_PROGRESS: "update-download-progress",
    UPDATE_DOWNLOADED: "update-downloaded",
    UPDATE_CHECK: "update-check",
    UPDATE_DOWNLOAD: "update-download",
    UPDATE_INSTALL_NOW: "update-install-now",
} as const;

export type IpcEvent = (typeof IPC_EVENTS)[keyof typeof IPC_EVENTS];
