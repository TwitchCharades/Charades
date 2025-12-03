import React, { useEffect, useState } from "react";
import { Lineicons } from "@lineiconshq/react-lineicons";
import {
    // CloudDownloadBulk,
    ExpandSquare4Solid,
    MinusSolid,
    XmarkSolid,
} from "@lineiconshq/free-icons";

export interface TitleBarProps {
    title?: string;
    icon?: any; // LineIcons IconData type
}

const TitleBar = ({ title, icon }: TitleBarProps) => {
    const [isChecking, setIsChecking] = useState(false);
    const hasCheckedRef = React.useRef(false);

    useEffect(() => {
        // Check for updates on mount (only once)
        // if (!hasCheckedRef.current) {
        //   hasCheckedRef.current = true;
        //   checkForUpdates();
        // }
        // Check for updates every hour
        // const interval = setInterval(checkForUpdates, 60 * 60 * 1000);
        // return () => clearInterval(interval);
    }, []);

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
                {/* {updateStatus?.available && (
          <button
            onClick={handleUpdateClick}
            className="flex w-10 h-full items-center justify-center hover:bg-[#2b2d31] transition-all duration-200 group relative"
            title={`Update available: v${updateStatus.info?.version}`}
          >
            <Lineicons icon={CloudDownloadBulk} size={24} className="text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </button>
        )} */}

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
