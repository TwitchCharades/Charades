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
            try {
                const [users, settings, charades] = await Promise.all([
                    this.db.getFirstUser(), // Only get first user for security
                    this.db.getAllSettings(),
                    this.db.getAllCharades(),
                ]);

                // Parse JSON fields in charades
                const parsedCharades = charades.map(charade => ({
                    ...charade,
                    channels: JSON.parse(charade.channels),
                    words: JSON.parse(charade.words),
                    settings: JSON.parse(charade.settings),
                }));

                return {
                    success: true,
                    data: {
                        user: users
                            ? {
                                  id: users.id,
                                  twitchId: users.twitchId,
                                  displayName: users.displayName,
                                  username: users.username,
                                  email: users.email,
                                  profilePicture: users.profilePicture,
                                  createdAt: users.createdAt,
                                  updatedAt: users.updatedAt,
                              }
                            : null,
                        settings,
                        charades: parsedCharades,
                    },
                };
            } catch (error) {
                console.error("Failed to get database data:", error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Failed to get database data",
                };
            }
        });
    }
}
