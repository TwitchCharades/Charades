import Database from "better-sqlite3";

interface User {
    twitchId: string;
    displayName: string;
    username: string;
    email?: string;
    profilePicture: string;
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
    tokenObtainedAt?: string;
    authData?: string; // JSON string for additional auth data
    createdAt?: string;
    updatedAt?: string;
}

interface Settings {
    id?: number;
    key: string;
    value: string;
    description?: string;
    updatedAt?: string;
}

interface Charades {
    id?: number;
    name: string;
    channels: string; // JSON array of channels
    words: string; // JSON array of words
    settings: string; // JSON object for charades-specific settings
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class DatabaseService {
    private db: Database.Database | null = null;

    constructor(private dbPath: string = "./database.sqlite") {}

    async initialize(): Promise<void> {
        try {
            this.db = new Database(this.dbPath);
            this.createTables();
        } catch (error) {
            throw error;
        }
    }

    private createTables(): void {
        if (!this.db) throw new Error("Database not initialized");

        // Users table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                twitchId TEXT PRIMARY KEY NOT NULL,
                displayName TEXT NOT NULL,
                username TEXT NOT NULL,
                email TEXT,
                profilePicture TEXT NOT NULL,
                accessToken TEXT NOT NULL,
                refreshToken TEXT NOT NULL,
                expiresIn INTEGER,
                tokenObtainedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                authData TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Settings table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL,
                description TEXT,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Charades table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS charades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                channels TEXT NOT NULL,
                words TEXT NOT NULL,
                settings TEXT NOT NULL DEFAULT '{}',
                isActive BOOLEAN DEFAULT 1,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes for better performance
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_users_displayName ON users(displayName)");
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key)");
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_charades_isActive ON charades(isActive)");
    }

    // User operations - Upsert on auth
    async upsertUser(user: Omit<User, "createdAt" | "updatedAt">): Promise<string> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare(`
            INSERT INTO users (twitchId, displayName, username, email, profilePicture, accessToken, refreshToken, expiresIn, tokenObtainedAt, authData)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
            ON CONFLICT(twitchId) DO UPDATE SET
                displayName = excluded.displayName,
                username = excluded.username,
                email = excluded.email,
                profilePicture = excluded.profilePicture,
                accessToken = excluded.accessToken,
                refreshToken = excluded.refreshToken,
                expiresIn = excluded.expiresIn,
                tokenObtainedAt = CURRENT_TIMESTAMP,
                authData = excluded.authData,
                updatedAt = CURRENT_TIMESTAMP
        `);

        stmt.run(
            user.twitchId,
            user.displayName,
            user.username,
            user.email,
            user.profilePicture,
            user.accessToken,
            user.refreshToken,
            user.expiresIn,
            user.authData
        );

        return user.twitchId;
    }

    async getUserByTwitchId(twitchId: string): Promise<User | null> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare("SELECT * FROM users WHERE twitchId = ?");
        return (stmt.get(twitchId) as User) || null;
    }

    async getUserByDisplayName(displayName: string): Promise<User | null> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare("SELECT * FROM users WHERE displayName = ?");
        return (stmt.get(displayName) as User) || null;
    }

    async getFirstUser(): Promise<User | null> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare("SELECT * FROM users LIMIT 1");
        return (stmt.get() as User) || null;
    }

    async updateUser(
        twitchId: string,
        updates: Partial<Omit<User, "twitchId" | "createdAt">>
    ): Promise<boolean> {
        if (!this.db) throw new Error("Database not initialized");

        const fields = Object.keys(updates)
            .map(key => `${key} = ?`)
            .join(", ");
        const values = Object.values(updates);

        const stmt = this.db.prepare(
            `UPDATE users SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE twitchId = ?`
        );

        const result = stmt.run(...values, twitchId);
        return result.changes > 0;
    }

    async deleteUser(twitchId: string): Promise<boolean> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare("DELETE FROM users WHERE twitchId = ?");
        const result = stmt.run(twitchId);
        return result.changes > 0;
    }

    // Settings CRUD operations
    async setSetting(key: string, value: string, description?: string): Promise<void> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO settings (key, value, description, updatedAt)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);

        stmt.run(key, value, description);
    }

    async getSetting(key: string): Promise<string | null> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare("SELECT value FROM settings WHERE key = ?");
        const result = stmt.get(key) as { value: string } | undefined;
        return result?.value || null;
    }

    async getAllSettings(): Promise<Settings[]> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare("SELECT * FROM settings ORDER BY key");
        return stmt.all() as Settings[];
    }

    async deleteSetting(key: string): Promise<boolean> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare("DELETE FROM settings WHERE key = ?");
        const result = stmt.run(key);
        return result.changes > 0;
    }

    // Charades CRUD operations
    async createCharade(
        charades: Omit<Charades, "id" | "createdAt" | "updatedAt">
    ): Promise<number> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare(`
            INSERT INTO charades (name, channels, words, settings, isActive)
            VALUES (?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            charades.name,
            charades.channels,
            charades.words,
            charades.settings,
            charades.isActive ? 1 : 0
        );

        return result.lastInsertRowid as number;
    }

    async getCharadeById(id: number): Promise<Charades | null> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare("SELECT * FROM charades WHERE id = ?");
        return (stmt.get(id) as Charades) || null;
    }

    async getAllCharades(): Promise<Charades[]> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare("SELECT * FROM charades ORDER BY name");
        return stmt.all() as Charades[];
    }

    async getActiveCharades(): Promise<Charades[]> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare("SELECT * FROM charades WHERE isActive = 1 ORDER BY name");
        return stmt.all() as Charades[];
    }

    async updateCharade(
        id: number,
        updates: Partial<Omit<Charades, "id" | "createdAt">>
    ): Promise<boolean> {
        if (!this.db) throw new Error("Database not initialized");

        const fields = Object.keys(updates)
            .map(key => `${key} = ?`)
            .join(", ");
        const values = Object.values(updates);

        const stmt = this.db.prepare(
            `UPDATE charades SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`
        );

        const result = stmt.run(...values, id);
        return result.changes > 0;
    }

    async deleteCharade(id: number): Promise<boolean> {
        if (!this.db) throw new Error("Database not initialized");

        const stmt = this.db.prepare("DELETE FROM charades WHERE id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }

    async close(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}
