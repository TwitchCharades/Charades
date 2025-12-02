import { IpcRenderer } from 'electron';

declare global {
    interface Window {
        electronAPI?: {
            windowActions: (action: 'minimize' | 'maximize' | 'close') => void;
        };
        ipcRenderer: {
            on: IpcRenderer['on'];
            off: IpcRenderer['off'];
            send: IpcRenderer['send'];
            invoke: IpcRenderer['invoke'];
        };
        electron: {
            isElectron: boolean;
        };
    }
}

export {};
