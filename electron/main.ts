import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { env } from '../config/env';

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

	constructor() {
		this.initialize();
	}

	private initialize(): void {
		app.whenReady().then(() => {
			this.createMainWindow();
			this.setupAppListeners();
		});

		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});
	}

  private createSplashWindow(): void {}

	private createMainWindow(): void {
		this.mainWindow = new BrowserWindow({
			width: 1200,
			height: 800,
			frame: false,
			icon: path.join(env.VITE_PUBLIC!, 'icon_512.png'),
			webPreferences: {
				nodeIntegration: false,
				contextIsolation: true,
				sandbox: false,
				preload: path.join(__dirname, 'preload.cjs'),
			},
			title: 'Charades',
			show: true,
		});

		// Test active push message to Renderer-process.
		this.mainWindow.webContents.on('did-finish-load', () => {
			this.mainWindow?.webContents.send('main-process-message', (new Date).toLocaleString());
		});

		if (env.VITE_DEV_SERVER_URL) {
			this.mainWindow.loadURL(env.VITE_DEV_SERVER_URL);
			this.mainWindow.webContents.openDevTools({ mode: 'detach' });
		} else {
			this.mainWindow.loadFile(path.join(env.RENDERER_DIST, 'index.html'));
		}

		this.setupIpcHandlers();
	}

	private setupIpcHandlers(): void {
		ipcMain.on('window-action', (_event, action: 'minimize' | 'maximize' | 'close') => {
			if (!this.mainWindow) return;
			
			switch (action) {
				case 'minimize':
					this.mainWindow.minimize();
					break;
				case 'maximize':
					if (this.mainWindow.isMaximized()) {
						this.mainWindow.unmaximize();
					} else {
						this.mainWindow.maximize();
					}
					break;
				case 'close':
					this.mainWindow.close();
					break;
			}
		});
	}

	private setupAppListeners(): void {
		app.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				this.createMainWindow();
			}
		});
	}
}

new MainApplication();
