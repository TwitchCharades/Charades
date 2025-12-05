import { IpcRenderer } from "electron";

declare global {
    interface Window {
        electronAPI?: {
            windowActions: (action: "minimize" | "maximize" | "close") => void;
            updateCheck: () => Promise<any>;
            updateDownload: () => Promise<any>;
            updateInstallNow: () => void;
            onHealthStatus: (
                callback: (data: {
                    status: string;
                    message: string;
                    attempts?: number;
                    maxRetries?: number;
                    error?: boolean;
                    data?: any;
                }) => void
            ) => void;
            auth: {
                init: () => Promise<{ success: boolean; error?: string }>;
                get: () => Promise<{
                    success: any;
                    authenticated: boolean;
                    user?: any;
                    expired?: boolean;
                    error?: string;
                }>;
                check: () => Promise<{ authenticated: boolean }>;
                logout: () => Promise<{ success: boolean; error?: string }>;
                onAuthSuccess: (
                    callback: (data: { displayName: string; profilePicture: string }) => void
                ) => void;
                removeAuthSuccessListener: () => void;
            };
        };
        ipcRenderer: {
            on: IpcRenderer["on"];
            off: IpcRenderer["off"];
            send: IpcRenderer["send"];
            invoke: IpcRenderer["invoke"];
        };
        electron: {
            isElectron: boolean;
        };
    }
}

export {};
