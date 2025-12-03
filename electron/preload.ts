import { ipcRenderer, contextBridge } from "electron";
import { IPC_EVENTS } from "../constants/ipc-events";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
    windowActions(action: "minimize" | "maximize" | "close") {
        ipcRenderer.send(IPC_EVENTS.WINDOW_ACTION, action);
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
