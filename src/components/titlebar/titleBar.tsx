import React, { useEffect, useState } from "react";
import { Lineicons } from "@lineiconshq/react-lineicons";
import {
    CloudDownloadBulk,
    ExpandSquare4Solid,
    MinusSolid,
    XmarkSolid,
} from "@lineiconshq/free-icons";

export interface TitleBarProps {
    title?: string;
    icon?: any; // LineIcons IconData type
}

interface UpdateStatus {
    available: boolean;
    downloading: boolean;
    downloaded: boolean;
    progress?: number;
    info?: any;
}

const TitleBar = ({ title, icon }: TitleBarProps) => {
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
        available: false,
        downloading: false,
        downloaded: false,
    });
    const hasCheckedRef = React.useRef(false);

    useEffect(() => {
        // Listen for update events from main process
        const updateAvailableListener = (_event: any, info: any) => {
            setUpdateStatus({
                available: true,
                downloading: false,
                downloaded: false,
                info,
            });
        };

        const updateNotAvailableListener = () => {
            setUpdateStatus({
                available: false,
                downloading: false,
                downloaded: false,
            });
        };

        const downloadProgressListener = (_event: any, progress: any) => {
            setUpdateStatus(prev => ({
                ...prev,
                downloading: true,
                progress: progress.percent,
            }));
        };

        const updateDownloadedListener = (_event: any, info: any) => {
            setUpdateStatus({
                available: true,
                downloading: false,
                downloaded: true,
                info,
            });
        };

        const updateErrorListener = (_event: any, error: any) => {
            console.error("Update error:", error);
            setUpdateStatus({
                available: false,
                downloading: false,
                downloaded: false,
            });
        };

        // Register listeners
        window.ipcRenderer.on("update-available", updateAvailableListener);
        window.ipcRenderer.on("update-not-available", updateNotAvailableListener);
        window.ipcRenderer.on("update-download-progress", downloadProgressListener);
        window.ipcRenderer.on("update-downloaded", updateDownloadedListener);
        window.ipcRenderer.on("update-error", updateErrorListener);

        // Check for updates on mount (only once)
        if (!hasCheckedRef.current && window.electronAPI) {
            hasCheckedRef.current = true;
            window.electronAPI.updateCheck().catch(err => {
                console.error("Failed to check for updates:", err);
            });
        }

        return () => {
            window.ipcRenderer.off("update-available", updateAvailableListener);
            window.ipcRenderer.off("update-not-available", updateNotAvailableListener);
            window.ipcRenderer.off("update-download-progress", downloadProgressListener);
            window.ipcRenderer.off("update-downloaded", updateDownloadedListener);
            window.ipcRenderer.off("update-error", updateErrorListener);
        };
    }, []);

    const handleUpdateClick = () => {
        if (!window.electronAPI) return;

        if (updateStatus.downloaded) {
            // Restart and install
            window.electronAPI.updateInstallNow();
        } else if (updateStatus.available && !updateStatus.downloading) {
            // Start download
            window.electronAPI.updateDownload().catch(err => {
                console.error("Failed to download update:", err);
            });
        }
    };

    const getUpdateButtonTitle = () => {
        if (updateStatus.downloaded) {
            return `Update ready! Click to restart and install v${updateStatus.info?.version || ""}`;
        }
        if (updateStatus.downloading) {
            return `Downloading update... ${Math.round(updateStatus.progress || 0)}%`;
        }
        if (updateStatus.available) {
            return `Update available: v${updateStatus.info?.version || ""} - Click to download`;
        }
        return "";
    };

    const handleWindow = (action: "minimize" | "maximize" | "close") => {
        window.electronAPI?.windowActions(action);
    };

    return (
        <div
            className="flex items-center justify-between h-8 px-2 bg-[#202225] text-[11px] text-gray-300 select-none"
            style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
            {/* Left side: app icon + name */}
            <div
                className="flex items-center gap-2"
                style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
            >
                <div className="h-4 w-4 rounded-md bg-[#5865F2]" />
                <span className="font-medium tracking-wide">Twitch Charades</span>
            </div>

            {/* Center: optional tabs / title */}
            <div className="flex-1 flex justify-center items-center gap-2 pointer-events-none">
                {icon && <Lineicons icon={icon} size={18} className="opacity-60" />}
                <span className="opacity-60">{title}</span>
            </div>

            {/* Right side: window controls */}
            <div
                className="flex items-stretch h-full"
                style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
            >
                {updateStatus.available && (
                    <button
                        onClick={handleUpdateClick}
                        disabled={updateStatus.downloading}
                        className={`flex w-10 h-full items-center justify-center transition-all duration-200 group relative ${
                            updateStatus.downloading
                                ? "cursor-wait opacity-50"
                                : "hover:bg-[#2b2d31]"
                        }`}
                        title={getUpdateButtonTitle()}
                    >
                        <Lineicons
                            icon={CloudDownloadBulk}
                            size={24}
                            className={`transition-colors ${
                                updateStatus.downloaded
                                    ? "text-green-400 group-hover:text-green-300 animate-pulse"
                                    : updateStatus.downloading
                                      ? "text-blue-400"
                                      : "text-emerald-400 group-hover:text-emerald-300"
                            }`}
                        />
                        {!updateStatus.downloaded && !updateStatus.downloading && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        )}
                    </button>
                )}

                <button
                    onClick={() => handleWindow("minimize")}
                    className="flex w-10 h-full items-center justify-center hover:bg-[#2b2d31] transition-all duration-200 group"
                >
                    <Lineicons
                        icon={MinusSolid}
                        size={20}
                        className="group-hover:scale-110 transition-transform pointer-events-none"
                    />
                </button>

                <button
                    onClick={() => handleWindow("maximize")}
                    className="flex w-10 h-full items-center justify-center hover:bg-[#2b2d31] transition-all duration-200 group"
                >
                    <Lineicons
                        icon={ExpandSquare4Solid}
                        size={20}
                        className="group-hover:scale-110 transition-transform pointer-events-none"
                    />
                </button>

                <button
                    onClick={() => handleWindow("close")}
                    className="flex w-10 h-full items-center justify-center hover:bg-[#ED4245] hover:text-white transition-all duration-200 group"
                >
                    <Lineicons
                        icon={XmarkSolid}
                        size={20}
                        className="group-hover:scale-110 transition-transform pointer-events-none"
                    />
                </button>
            </div>
        </div>
    );
};

export default TitleBar;
