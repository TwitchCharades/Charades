import { ipcMain } from "electron";
import { IPC_EVENTS } from "../constants/ipc-events";
import { DatabaseService } from "../services/database";

export class DatabaseHandler {
    private db: DatabaseService;

    constructor(db: DatabaseService) {
        this.db = db;
        this.setupHandlers();
    }

    private setupHandlers(): void {
        // Get all database data
        ipcMain.handle(IPC_EVENTS.DB_GET_ALL_DATA, async () => {
            
        });
    }
}
