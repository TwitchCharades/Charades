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

    // Twitch Authentication
    TWITCH_AUTH_INIT: "twitch:auth:init",
    TWITCH_AUTH_SAVE: "twitch:auth:save",
    TWITCH_AUTH_GET: "twitch:auth:get",
    TWITCH_AUTH_LOGOUT: "twitch:auth:logout",
    TWITCH_AUTH_CHECK: "twitch:auth:check",
    TWITCH_AUTH_CALLBACK: "twitch:auth:callback",

    // Database
    DB_SAVE_SETTINGS: "db:save-settings",
    DB_GET_SETTINGS: "db:get-settings",
    DB_GET_ALL_DATA: "db:get-all-data",
} as const;

export type IpcEvent = (typeof IPC_EVENTS)[keyof typeof IPC_EVENTS];
