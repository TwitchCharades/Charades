import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { env } from "../config/env";
import { IPC_EVENTS } from "../constants/ipc-events";
import { APP_EVENTS } from "../constants/app-events";
import { createChildLogger } from "../utils/logger";

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

    constructor() {
        this.logger.info("Initializing Electron application");
        this.initialize();
    }

    private initialize(): void {
        app.whenReady().then(() => {
            this.logger.info("App is ready");
            this.createSplashWindow();
            this.setupAppListeners();
        });

        app.on(APP_EVENTS.WINDOWS_ALL_CLOSED, () => {
            this.logger.info("All windows closed");
            if (process.platform !== "darwin") {
                this.logger.info("Quitting application");
                app.quit();
            }
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
        const retryDelay = 1000;
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
                const response = await fetch("https://api.sampleapis.com/wines/reds");

                if (response.ok) {
                    const data = await response.json();
                    this.logger.info({ attempts }, "Microservice health check passed");
                    this.splashWindow?.webContents.send(IPC_EVENTS.HEALTH_STATUS, {
                        status: "online",
                        message: "Microservice connected",
                        data,
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
}

new MainApplication();
