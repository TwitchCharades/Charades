import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import path from "path";

interface User {
    id?: number;
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
    private db: Database | null = null;

    constructor(private dbPath: string = "./database.sqlite") {}

    async initialize(): Promise<void> {
        try {
            this.db = await open({
                filename: this.dbPath,
                driver: sqlite3.Database,
            });

            await this.createTables();
        } catch (error) {
            throw error;
        }
    }

    private async createTables(): Promise<void> {
        if (!this.db) throw new Error("Database not initialized");

        // Users table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                twitchId TEXT UNIQUE NOT NULL,
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
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL,
                description TEXT,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Charades table
        await this.db.exec(`
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
        await this.db.exec("CREATE INDEX IF NOT EXISTS idx_users_twitchId ON users(twitchId)");
        await this.db.exec(
            "CREATE INDEX IF NOT EXISTS idx_users_displayName ON users(displayName)"
        );
        await this.db.exec("CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key)");
        await this.db.exec(
            "CREATE INDEX IF NOT EXISTS idx_charades_isActive ON charades(isActive)"
        );
    }

    // User CRUD operations
    async createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<number> {
        if (!this.db) throw new Error("Database not initialized");

        const result = await this.db.run(
            `
            INSERT INTO users (twitchId, displayName, username, email, profilePicture, accessToken, refreshToken, expiresIn, authData)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            [
                user.twitchId,
                user.displayName,
                user.username,
                user.email,
                user.profilePicture,
                user.accessToken,
                user.refreshToken,
                user.expiresIn,
                user.authData,
            ]
        );

        return result.lastID!;
    }

    async getUserById(id: number): Promise<User | null> {
        if (!this.db) throw new Error("Database not initialized");

        return (await this.db.get("SELECT * FROM users WHERE id = ?", [id])) || null;
    }

    async getUserByDisplayName(displayName: string): Promise<User | null> {
        if (!this.db) throw new Error("Database not initialized");

        return (
            (await this.db.get("SELECT * FROM users WHERE displayName = ?", [displayName])) || null
        );
    }

    async getUserByTwitchId(twitchId: string): Promise<User | null> {
        if (!this.db) throw new Error("Database not initialized");

        return (await this.db.get("SELECT * FROM users WHERE twitchId = ?", [twitchId])) || null;
    }

    async getFirstUser(): Promise<User | null> {
        if (!this.db) throw new Error("Database not initialized");

        return (await this.db.get("SELECT * FROM users LIMIT 1")) || null;
    }

    async upsertUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<number> {
        if (!this.db) throw new Error("Database not initialized");

        // Check if user exists
        const existingUser = await this.getUserByTwitchId(user.twitchId);

        if (existingUser) {
            // Update existing user
            await this.db.run(
                `
                UPDATE users 
                SET displayName = ?, username = ?, email = ?, profilePicture = ?, 
                    accessToken = ?, refreshToken = ?, expiresIn = ?, 
                    tokenObtainedAt = CURRENT_TIMESTAMP, authData = ?, updatedAt = CURRENT_TIMESTAMP
                WHERE twitchId = ?
            `,
                [
                    user.displayName,
                    user.username,
                    user.email,
                    user.profilePicture,
                    user.accessToken,
                    user.refreshToken,
                    user.expiresIn,
                    user.authData,
                    user.twitchId,
                ]
            );
            return existingUser.id!;
        } else {
            // Create new user
            return await this.createUser(user);
        }
    }

    async updateUser(
        id: number,
        updates: Partial<Omit<User, "id" | "createdAt">>
    ): Promise<boolean> {
        if (!this.db) throw new Error("Database not initialized");

        const fields = Object.keys(updates)
            .map(key => `${key} = ?`)
            .join(", ");
        const values = Object.values(updates);

        const result = await this.db.run(
            `
            UPDATE users SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
        `,
            [...values, id]
        );

        return (result.changes ?? 0) > 0;
    }

    async deleteUser(id: number): Promise<boolean> {
        if (!this.db) throw new Error("Database not initialized");

        const result = await this.db.run("DELETE FROM users WHERE id = ?", [id]);
        return (result.changes ?? 0) > 0;
    }

    // Settings CRUD operations
    async setSetting(key: string, value: string, description?: string): Promise<void> {
        if (!this.db) throw new Error("Database not initialized");

        await this.db.run(
            `
            INSERT OR REPLACE INTO settings (key, value, description, updatedAt)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `,
            [key, value, description]
        );
    }

    async getSetting(key: string): Promise<string | null> {
        if (!this.db) throw new Error("Database not initialized");

        const result = await this.db.get("SELECT value FROM settings WHERE key = ?", [key]);
        return result?.value || null;
    }

    async getAllSettings(): Promise<Settings[]> {
        if (!this.db) throw new Error("Database not initialized");

        return await this.db.all("SELECT * FROM settings ORDER BY key");
    }

    async deleteSetting(key: string): Promise<boolean> {
        if (!this.db) throw new Error("Database not initialized");

        const result = await this.db.run("DELETE FROM settings WHERE key = ?", [key]);
        return (result.changes ?? 0) > 0;
    }

    // Charades CRUD operations
    async createCharade(
        charades: Omit<Charades, "id" | "createdAt" | "updatedAt">
    ): Promise<number> {
        if (!this.db) throw new Error("Database not initialized");

        const result = await this.db.run(
            `
            INSERT INTO charades (name, channels, words, settings, isActive)
            VALUES (?, ?, ?, ?, ?)
        `,
            [charades.name, charades.channels, charades.words, charades.settings, charades.isActive]
        );

        return result.lastID!;
    }

    async getCharadeById(id: number): Promise<Charades | null> {
        if (!this.db) throw new Error("Database not initialized");

        return (await this.db.get("SELECT * FROM charades WHERE id = ?", [id])) || null;
    }

    async getAllCharades(): Promise<Charades[]> {
        if (!this.db) throw new Error("Database not initialized");

        return await this.db.all("SELECT * FROM charades ORDER BY name");
    }

    async getActiveCharades(): Promise<Charades[]> {
        if (!this.db) throw new Error("Database not initialized");

        return await this.db.all("SELECT * FROM charades WHERE isActive = 1 ORDER BY name");
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

        const result = await this.db.run(
            `
            UPDATE charades SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
        `,
            [...values, id]
        );

        return (result.changes ?? 0) > 0;
    }

    async deleteCharade(id: number): Promise<boolean> {
        if (!this.db) throw new Error("Database not initialized");

        const result = await this.db.run("DELETE FROM charades WHERE id = ?", [id]);
        return (result.changes ?? 0) > 0;
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
}
