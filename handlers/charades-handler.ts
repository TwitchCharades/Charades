import { ipcMain, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { IPC_EVENTS } from "../constants/ipc-events";
import { DatabaseService } from "../services/database";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


export class CharadesHandler {
    private db: DatabaseService;

    constructor(db: DatabaseService) {
        this.db = db;
        this.setupHandlers();
    }

    private setupHandlers(): void {}
}