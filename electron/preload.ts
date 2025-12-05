import { ipcRenderer, contextBridge } from "electron";
import { IPC_EVENTS } from "../constants/ipc-events";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
    windowActions(action: "minimize" | "maximize" | "close") {
        ipcRenderer.send(IPC_EVENTS.WINDOW_ACTION, action);
    },
    onHealthStatus: (
        callback: (data: {
            status: string;
            message: string;
            attempts?: number;
            maxRetries?: number;
            error?: boolean;
        }) => void
    ) => {
        ipcRenderer.on(IPC_EVENTS.HEALTH_STATUS, (_event, data) => callback(data));
    },
    updateCheck() {
        return ipcRenderer.invoke(IPC_EVENTS.UPDATE_CHECK);
    },
    updateDownload() {
        return ipcRenderer.invoke(IPC_EVENTS.UPDATE_DOWNLOAD);
    },
    updateInstallNow() {
        return ipcRenderer.invoke(IPC_EVENTS.UPDATE_INSTALL_NOW);
    },
    auth: {
        init: (): Promise<{ success: boolean; error?: string }> =>
            ipcRenderer.invoke(IPC_EVENTS.TWITCH_AUTH_INIT),
        get: (): Promise<{
            authenticated: boolean;
            user?: any;
            expired?: boolean;
            error?: string;
        }> => ipcRenderer.invoke(IPC_EVENTS.TWITCH_AUTH_GET),
        check: (): Promise<{ authenticated: boolean }> =>
            ipcRenderer.invoke(IPC_EVENTS.TWITCH_AUTH_CHECK),
        logout: (): Promise<{ success: boolean; error?: string }> =>
            ipcRenderer.invoke(IPC_EVENTS.TWITCH_AUTH_LOGOUT),
        onAuthSuccess: (
            callback: (data: { displayName: string; profilePicture: string }) => void
        ) => {
            ipcRenderer.on(IPC_EVENTS.TWITCH_AUTH_SUCCESS, (_event, data) => callback(data));
        },
        removeAuthSuccessListener: () => {
            ipcRenderer.removeAllListeners(IPC_EVENTS.TWITCH_AUTH_SUCCESS);
        },
    },
});

contextBridge.exposeInMainWorld("ipcRenderer", {
    on(...args: Parameters<typeof ipcRenderer.on>) {
        const [channel, listener] = args;
        return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
        const [channel, ...omit] = args;
        return ipcRenderer.off(channel, ...omit);
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
        const [channel, ...omit] = args;
        return ipcRenderer.send(channel, ...omit);
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
        const [channel, ...omit] = args;
        return ipcRenderer.invoke(channel, ...omit);
    },

    // You can expose other APTs you need here.
    // ...
});

// Expose electron flag
contextBridge.exposeInMainWorld("electron", {
    isElectron: true,
});
