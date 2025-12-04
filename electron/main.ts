import { app, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { env } from "../config/env";
import { IPC_EVENTS } from "../constants/ipc-events";
import { APP_EVENTS } from "../constants/app-events";
import { createChildLogger } from "../utils/logger";
import { checkMicroserviceHealth } from "../api/healthCheck";
import { DatabaseService } from "../services/database";
import { DatabaseHandler } from "../handlers/database-handler";
import { AuthHandler } from "../handlers/auth-handler";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │

class MainApplication {
    private mainWindow: BrowserWindow | null = null;
    private splashWindow: BrowserWindow | null = null;
    private healthCheckPassed: boolean = false;
    private logger = createChildLogger({ context: "MainApplication" });
    private db: DatabaseService;
    private authHandler: AuthHandler;
    private databaseHandler: DatabaseHandler;

    constructor() {
        this.logger.info("Initializing Electron application");
        this.db = new DatabaseService(path.join(app.getPath("userData"), "database.sqlite"));
        this.authHandler = new AuthHandler(this.db);
        this.databaseHandler = new DatabaseHandler(this.db);
        this.initialize();
        this.setupAutoUpdater();
    }

    private async initialize(): Promise<void> {
        app.whenReady().then(async () => {
            this.logger.info("App is ready");
            
            // Initialize database before creating windows
            try {
                this.logger.info("Initializing database");
                await this.db.initialize();
                this.logger.info("Database initialized successfully");
            } catch (error) {
                this.logger.error({ error }, "Failed to initialize database");
                app.quit();
                return;
            }
            
            this.createSplashWindow();
            this.setupAppListeners();
        });

        app.on(APP_EVENTS.WINDOWS_ALL_CLOSED, () => {
            this.logger.info("All windows closed");
            // Quit on all platforms
            this.logger.info("Quitting application");
            app.quit();
        });

        app.on(APP_EVENTS.BEFORE_QUIT, () => {
            this.logger.info("App is about to quit");
            // Clean up resources
            this.mainWindow = null;
            this.splashWindow = null;
        });

        app.on(APP_EVENTS.WILL_QUIT, () => {
            this.logger.info("App will quit");
        });
    }

    private createSplashWindow(): void {
        this.logger.info("Creating splash window");
        this.splashWindow = new BrowserWindow({
            width: 550,
            height: 520,
            frame: false,
            alwaysOnTop: true,
            transparent: true,
            icon: path.join(env.VITE_PUBLIC!, "icon_512.png"),
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: false,
                preload: path.join(__dirname, "preload.cjs"),
            },
        });

        if (env.VITE_DEV_SERVER_URL) {
            this.splashWindow.loadFile(path.join(env.VITE_PUBLIC!, "splash.html"));
        } else {
            this.splashWindow.loadFile(path.join(env.RENDERER_DIST, "splash.html"));
        }

        this.splashWindow.webContents.on(APP_EVENTS.DID_FINISH_LOAD, () => {
            this.logger.info("Splash window loaded, starting health check");
            // Start health check immediately, don't close splash until it's done
            this.checkMicroserviceAvailability();
        });
    }

    private async createMainWindow(): Promise<void> {
        this.logger.info("Creating main window");
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            frame: false,
            icon: path.join(env.VITE_PUBLIC!, "icon_512.png"),
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: false,
                preload: path.join(__dirname, "preload.cjs"),
            },
            title: "Charades",
            show: true,
        });

        // Test active push message to Renderer-process.
        this.mainWindow.webContents.on(APP_EVENTS.DID_FINISH_LOAD, () => {
            this.mainWindow?.webContents.send(
                APP_EVENTS.MAIN_PROCESS_MESSAGE,
                new Date().toLocaleString()
            );
        });

        if (env.VITE_DEV_SERVER_URL) {
            this.logger.info({ url: env.VITE_DEV_SERVER_URL }, "Loading dev server URL");
            this.mainWindow.loadURL(env.VITE_DEV_SERVER_URL);
            this.mainWindow.webContents.openDevTools({ mode: "detach" });
        } else {
            this.logger.info("Loading production build");
            this.mainWindow.loadFile(path.join(env.RENDERER_DIST, "index.html"));
        }

        this.setupIpcHandlers();
    }

    private async checkMicroserviceAvailability(): Promise<void> {
        // Placeholder for microservice availability check
        const maxRetries = 10;
        const retryDelay = 2000;
        let attempts = 0;

        this.logger.info({ maxRetries, retryDelay }, "Starting microservice health check");

        while (attempts < maxRetries) {
            attempts++;
            this.logger.debug({ attempts, maxRetries }, "Attempting health check");

            this.splashWindow?.webContents.send(IPC_EVENTS.HEALTH_STATUS, {
                status: "checking",
                message: `Connecting to microservice... (${attempts}/${maxRetries})`,
                attempts,
                maxRetries,
            });

            try {
                const result = await checkMicroserviceHealth();

                if (result.ok) {
                    this.logger.info({ attempts }, "Microservice health check passed");
                    this.splashWindow?.webContents.send(IPC_EVENTS.HEALTH_STATUS, {
                        status: "online",
                        message: "Microservice connected",
                        data: result.data,
                    });
                    this.healthCheckPassed = true;

                    // Wait longer to show success status
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    this.logger.info("Closing splash window");
                    // Close splash window before creating main window
                    this.splashWindow?.close();
                    this.splashWindow = null;

                    // Health check passed, now create the main window
                    await this.createMainWindow();
                    return;
                } else {
                    // Health check failed but didn't throw
                    throw new Error(result.error || "Health check returned not ok");
                }
            } catch (error) {
                this.logger.warn({ error, attempts, maxRetries }, "Health check failed");
                if (attempts < maxRetries) {
                    this.logger.debug({ retryDelay }, "Waiting before retry");
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        }
        this.logger.error({ maxRetries }, "Health check failed after all retries");

        // Send offline status to splash window
        this.splashWindow?.webContents.send(IPC_EVENTS.HEALTH_STATUS, {
            status: "offline",
            message: "Unable to connect to microservice",
            error: true,
        });

        // Wait to show the error message, then quit
        await new Promise(resolve => setTimeout(resolve, 3000));

        this.logger.error("Exiting application due to failed health check");
        this.splashWindow?.close();
        this.splashWindow = null;
        app.quit();
    }

    private setupIpcHandlers(): void {
        this.logger.info("Setting up IPC handlers");
        ipcMain.on(
            IPC_EVENTS.WINDOW_ACTION,
            (_event, action: "minimize" | "maximize" | "close") => {
                if (!this.mainWindow) return;

                this.logger.debug({ action }, "Window action received");
                switch (action) {
                    case "minimize":
                        this.mainWindow.minimize();
                        break;
                    case "maximize":
                        if (this.mainWindow.isMaximized()) {
                            this.mainWindow.unmaximize();
                        } else {
                            this.mainWindow.maximize();
                        }
                        break;
                    case "close":
                        this.mainWindow.close();
                        break;
                }
            }
        );

        // Update IPC handlers
        ipcMain.handle(IPC_EVENTS.UPDATE_CHECK, async () => {
            this.logger.info("Manual update check requested");
            return autoUpdater.checkForUpdates();
        });

        ipcMain.handle(IPC_EVENTS.UPDATE_DOWNLOAD, async () => {
            this.logger.info("Update download requested");
            return autoUpdater.downloadUpdate();
        });

        ipcMain.handle(IPC_EVENTS.UPDATE_INSTALL_NOW, () => {
            this.logger.info("Update install requested, quitting and installing");
            autoUpdater.quitAndInstall();
        });
    }

    private setupAppListeners(): void {
        this.logger.info("Setting up app listeners");
        app.on(APP_EVENTS.ACTIVATE, () => {
            this.logger.info("App activated");
            if (BrowserWindow.getAllWindows().length === 0) {
                this.logger.info("No windows found, creating main window");
                this.createMainWindow();
            }
        });
    }

    private setupAutoUpdater(): void {
        this.logger.info("Setting up auto-updater");

        // Don't download automatically, let user trigger it
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = true;

        // Force dev updates for testing (remove in production)
        if (env.VITE_DEV_SERVER_URL) {
            this.logger.info("Dev mode: Forcing update checks for testing");
            autoUpdater.forceDevUpdateConfig = true;
        }

        autoUpdater.on("update-available", info => {
            this.logger.info({ version: info.version }, "Update available");
            this.mainWindow?.webContents.send(IPC_EVENTS.UPDATE_AVAILABLE, info);
        });

        autoUpdater.on("update-not-available", () => {
            this.logger.info("Update not available");
            this.mainWindow?.webContents.send(IPC_EVENTS.UPDATE_NOT_AVAILABLE);
        });

        autoUpdater.on("error", err => {
            this.logger.error({ error: err }, "Update error");
            this.mainWindow?.webContents.send(IPC_EVENTS.UPDATE_ERROR, err.message);
        });

        autoUpdater.on("download-progress", progress => {
            this.logger.debug({ percent: progress.percent }, "Download progress");
            this.mainWindow?.webContents.send(IPC_EVENTS.UPDATE_DOWNLOAD_PROGRESS, progress);
        });

        autoUpdater.on("update-downloaded", info => {
            this.logger.info({ version: info.version }, "Update downloaded");
            this.mainWindow?.webContents.send(IPC_EVENTS.UPDATE_DOWNLOADED, info);
        });

        // Optional: Check for updates on startup (after main window is created)
        setTimeout(() => {
            if (this.mainWindow) {
                this.logger.info("Running initial update check");
                autoUpdater.checkForUpdates().catch(err => {
                    this.logger.warn({ error: err }, "Initial update check failed");
                });
            }
        }, 3000); // Wait 3 seconds after app starts
    }
}

new MainApplication();
