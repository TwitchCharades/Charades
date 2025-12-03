import { ipcMain, BrowserWindow } from "electron";
import { IPC_EVENTS } from "../constants/ipc-events";
import { DatabaseService } from "../services/database";

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

                    // Navigate main window to auth page with error
                    const mainWindow = BrowserWindow.getAllWindows().find(
                        w => !w.isDestroyed() && w !== this.authWindow
                    );
                    if (mainWindow) {
                        mainWindow.loadURL(
                            "http://localhost:5173/auth?error=" + encodeURIComponent(authData.error)
                        );
                    }

                    return { success: false };
                }

                // Save auth data
                const userId = await this.db.upsertUser({
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

                // Navigate main window to home
                const mainWindow = BrowserWindow.getAllWindows().find(
                    w => !w.isDestroyed() && w !== this.authWindow
                );
                if (mainWindow) {
                    mainWindow.loadURL("http://localhost:5173/");
                }

                return { success: true, userId };
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
                        preload: require("path").join(__dirname, "../preload.js"),
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

                                    const mainWindow = BrowserWindow.getAllWindows().find(
                                        w => !w.isDestroyed() && w !== this.authWindow
                                    );
                                    if (mainWindow) {
                                        mainWindow.loadURL(
                                            "http://localhost:5173/auth?error=" +
                                                encodeURIComponent(authData.error)
                                        );
                                    }
                                } else {
                                    // Save auth data
                                    const userId = await this.db.upsertUser({
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

                                    // Navigate main window to home
                                    const mainWindow = BrowserWindow.getAllWindows().find(
                                        w => !w.isDestroyed() && w !== this.authWindow
                                    );
                                    if (mainWindow) {
                                        mainWindow.loadURL("http://localhost:5173/");
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
                    const userId = await this.db.upsertUser({
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
                    return { success: true, userId };
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
        ipcMain.handle(IPC_EVENTS.TWITCH_AUTH_GET, async () => {
            try {
                const user = await this.db.getFirstUser();

                if (!user) {
                    return { authenticated: false };
                }

                // Check if token is expired (if we have expiresIn data)
                if (user.expiresIn && user.tokenObtainedAt) {
                    const obtainedAt = new Date(user.tokenObtainedAt).getTime();
                    const expiresAt = obtainedAt + user.expiresIn * 1000;
                    const now = Date.now();

                    if (now >= expiresAt) {
                        // Token expired - could implement refresh logic here
                        console.log("Token expired for user:", user.displayName);
                        return {
                            authenticated: false,
                            expired: true,
                            user: {
                                displayName: user.displayName,
                                username: user.username,
                            },
                        };
                    }
                }

                return {
                    authenticated: true,
                    user: {
                        id: user.id,
                        twitchId: user.twitchId,
                        displayName: user.displayName,
                        username: user.username,
                        email: user.email,
                        profilePicture: user.profilePicture,
                    },
                };
            } catch (error) {
                console.error("Failed to get auth data:", error);
                return {
                    authenticated: false,
                    error: error instanceof Error ? error.message : "Failed to get auth data",
                };
            }
        });

        // Check if user is authenticated (lighter version)
        ipcMain.handle(IPC_EVENTS.TWITCH_AUTH_CHECK, async () => {
            try {
                const user = await this.db.getFirstUser();
                return { authenticated: !!user };
            } catch (error) {
                return { authenticated: false };
            }
        });

        // Logout
        ipcMain.handle(IPC_EVENTS.TWITCH_AUTH_LOGOUT, async () => {
            try {
                // Get user before deleting
                const user = await this.db.getFirstUser();

                if (user) {
                    await this.db.deleteUser(user.id!);
                    console.log("User logged out:", user.displayName);
                }

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
