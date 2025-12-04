import { ipcMain, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { IPC_EVENTS } from "../constants/ipc-events";
import { DatabaseService } from "../services/database";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class AuthHandler {
    private db: DatabaseService;
    private authWindow: BrowserWindow | null = null;

    constructor(db: DatabaseService) {
        this.db = db;
        this.setupHandlers();
    }

    private setupHandlers(): void {
        ipcMain.handle(IPC_EVENTS.TWITCH_AUTH_CALLBACK, async (_event, authData: any) => {
            try {
                if (authData.error) {
                    // Handle error
                    console.error("Authentication error:", authData.error);
                    this.closeAuthWindow();
                    return { success: false };
                }

                // Save auth data
                const twitchId = await this.db.upsertUser({
                    twitchId: authData.user_id,
                    displayName: authData.display_name,
                    username: authData.username,
                    email: authData.email,
                    profilePicture: authData.profile_image_url,
                    accessToken: authData.access_token,
                    refreshToken: authData.refresh_token,
                    expiresIn: parseInt(authData.expires_in),
                    authData: JSON.stringify(authData),
                });

                console.log("User authenticated and saved:", authData.display_name);

                // Close auth window after a brief delay to show success animation
                setTimeout(() => {
                    this.closeAuthWindow();
                }, 1500);

                // Send success event to main window to navigate using React Router
                const mainWindow = BrowserWindow.getAllWindows().find(
                    w => !w.isDestroyed() && w !== this.authWindow
                );
                if (mainWindow) {
                    mainWindow.webContents.send(IPC_EVENTS.TWITCH_AUTH_SUCCESS, {
                        displayName: authData.display_name,
                        profilePicture: authData.profile_image_url,
                    });
                }

                return { success: true, twitchId };
            } catch (error) {
                console.error("Failed to process auth callback:", error);
                this.closeAuthWindow();
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error",
                };
            }
        });

        // Initialize Twitch OAuth flow
        ipcMain.handle(IPC_EVENTS.TWITCH_AUTH_INIT, async () => {
            try {
                // Create popup window for OAuth
                this.authWindow = new BrowserWindow({
                    width: 500,
                    height: 700,
                    center: true,
                    resizable: false,
                    alwaysOnTop: true,
                    title: "Sign in with Twitch",
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true,
                        sandbox: false,
                        preload: path.join(__dirname, "preload.cjs"),
                    },
                });

                const authUrl = "http://localhost:3000/auth/login";
                this.authWindow.loadURL(authUrl);

                // Intercept navigation to callback URL and extract auth data
                this.authWindow.webContents.on("will-redirect", async (event, url) => {
                    if (url.startsWith("http://localhost:3000/auth/callback")) {
                        event.preventDefault();

                        // Let the page load to get the auth data
                        // The page will have JavaScript that we can execute
                    }
                });

                // Intercept when callback page finishes loading
                this.authWindow.webContents.on("did-finish-load", async () => {
                    const currentUrl = this.authWindow?.webContents.getURL();

                    if (
                        currentUrl?.startsWith("http://localhost:3000/auth/callback") &&
                        this.authWindow
                    ) {
                        // Execute script to get auth data from the page
                        try {
                            const authData = await this.authWindow.webContents.executeJavaScript(`
                                window.__AUTH_DATA__
                            `);

                            if (authData) {
                                if (authData.error) {
                                    console.error("Authentication error:", authData.error);
                                    this.closeAuthWindow();
                                } else {
                                    // Save auth data
                                    await this.db.upsertUser({
                                        twitchId: authData.user_id,
                                        displayName: authData.display_name,
                                        username: authData.username,
                                        email: authData.email,
                                        profilePicture: authData.profile_image_url,
                                        accessToken: authData.access_token,
                                        refreshToken: authData.refresh_token,
                                        expiresIn: parseInt(authData.expires_in),
                                        authData: JSON.stringify(authData),
                                    });

                                    console.log(
                                        "User authenticated and saved:",
                                        authData.display_name
                                    );

                                    // Close auth window after brief delay
                                    setTimeout(() => {
                                        this.closeAuthWindow();
                                    }, 1500);

                                    // Send success event to main window to navigate using React Router
                                    const mainWindow = BrowserWindow.getAllWindows().find(
                                        w => !w.isDestroyed() && w !== this.authWindow
                                    );
                                    if (mainWindow) {
                                        mainWindow.webContents.send(
                                            IPC_EVENTS.TWITCH_AUTH_SUCCESS,
                                            {
                                                displayName: authData.display_name,
                                                profilePicture: authData.profile_image_url,
                                            }
                                        );
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Failed to extract auth data:", error);
                        }
                    }
                });

                // Clean up when window is closed
                this.authWindow.on("closed", () => {
                    this.authWindow = null;
                });

                return { success: true };
            } catch (error) {
                console.error("Failed to open auth window:", error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Failed to open auth window",
                };
            }
        });

        // Save authentication data
        ipcMain.handle(
            IPC_EVENTS.TWITCH_AUTH_SAVE,
            async (
                _event,
                authData: {
                    access_token: string;
                    refresh_token: string;
                    expires_in: string;
                    user_id: string;
                    username: string;
                    display_name: string;
                    profile_image_url: string;
                    email: string;
                }
            ) => {
                try {
                    const twitchId = await this.db.upsertUser({
                        twitchId: authData.user_id,
                        displayName: authData.display_name,
                        username: authData.username,
                        email: authData.email,
                        profilePicture: authData.profile_image_url,
                        accessToken: authData.access_token,
                        refreshToken: authData.refresh_token,
                        expiresIn: parseInt(authData.expires_in),
                        authData: JSON.stringify(authData),
                    });

                    console.log("User authenticated and saved:", authData.display_name);
                    return { success: true, twitchId };
                } catch (error) {
                    console.error("Failed to save auth data:", error);
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : "Failed to save auth data",
                    };
                }
            }
        );

        // Get current authentication status
        ipcMain.handle(IPC_EVENTS.TWITCH_AUTH_GET, async (_event, twitchId: string) => {
            try {
                const user = await this.db.getUserByTwitchId(twitchId);
                return { success: true, user };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Failed to get user",
                };
            }
        });

        // Check if user is authenticated (lighter version)
        ipcMain.handle(IPC_EVENTS.TWITCH_AUTH_CHECK, async (_event, twitchId: string) => {
            try {
                const user = await this.db.getUserByTwitchId(twitchId);
                return { authenticated: !!user };
            } catch (error) {
                return { authenticated: false };
            }
        });

        // Logout
        ipcMain.handle(IPC_EVENTS.TWITCH_AUTH_LOGOUT, async (_event, twitchId: string) => {
            try {
                // Get existing user data first
                const existingUser = await this.db.getUserByTwitchId(twitchId);
                if (!existingUser) {
                    return {
                        success: false,
                        error: "User not found",
                    };
                }

                // Update user with cleared tokens but keep other data
                await this.db.upsertUser({
                    twitchId: existingUser.twitchId,
                    displayName: existingUser.displayName,
                    username: existingUser.username,
                    email: existingUser.email,
                    profilePicture: existingUser.profilePicture,
                    accessToken: "",
                    refreshToken: "",
                    expiresIn: existingUser.expiresIn,
                    authData: existingUser.authData,
                });

                return { success: true };
            } catch (error) {
                console.error("Failed to logout:", error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Failed to logout",
                };
            }
        });
    }

    public closeAuthWindow(): void {
        if (this.authWindow && !this.authWindow.isDestroyed()) {
            this.authWindow.close();
            this.authWindow = null;
        }
    }
}
