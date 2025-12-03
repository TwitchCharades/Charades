import { NavLink } from "react-router";
import { PATHS } from "../../routes/paths";
import { Lineicons } from "@lineiconshq/react-lineicons";
import {
    Home2Outlined,
    Gear1Duotone,
    Locked1Duotone,
    TwitchOutlined,
} from "@lineiconshq/free-icons";
import { useEffect, useState } from "react";

const navItems = [
    { href: PATHS.home, label: "Home", initial: Home2Outlined },
    { href: PATHS.settings, label: "Settings", initial: Gear1Duotone },
];

const Sidebar = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const loadUserData = async () => {
        try {
            if (window.electronAPI?.auth) {
                const result = await window.electronAPI.auth.get();
                if (result.authenticated && result.user) {
                    setUser(result.user);
                }
            }
        } catch (error) {
            console.error("Failed to load user data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
    }, []);

    return (
        <aside
            className="
                h-full
                w-16
                flex flex-col
                items-center
                bg-[#111318]
                border-r border-[#202225]
                text-(--text-primary)
                py-3
                gap-3
            "
        >
            {/* App "logo" circle */}
            <div className="flex items-center justify-center h-12">
                <Lineicons icon={TwitchOutlined} size={32} color="var(--text-primary)" />
            </div>

            {/* Divider */}
            <div className="h-px w-8 bg-[#202225] my-1" />

            {/* Nav circles */}
            <nav className="flex-1 flex flex-col items-center gap-2 mt-1">
                {navItems.map(item => (
                    <div key={item.href} className="relative group">
                        <NavLink
                            to={item.href}
                            className={({ isActive }) => `
                                h-10 w-10
                                rounded-3xl
                                flex items-center justify-center
                                text-sm font-semibold
                                transition-all
                                ${
                                    isActive
                                        ? "text-white rounded-2xl bg-[#5865f2]/20 border border-[#5865f2]/40 hover:bg-[#5865f2]/30"
                                        : "bg-[#1a1b1f] text-(--text-secondary) hover:bg-[#26272d] border border-[#202225]"
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <Lineicons
                                        icon={item.initial}
                                        size={24}
                                        color={isActive ? "white" : "var(--text-secondary)"}
                                    />
                                    {isActive && (
                                        <span
                                            className="
                                                absolute
                                                -left-3
                                                h-8
                                                w-1
                                                rounded-r-full
                                                bg-white
                                            "
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                        {/* Tooltip */}
                        <div
                            className="
                                absolute left-full ml-3 top-1/2 -translate-y-1/2
                                px-3 py-1.5
                                bg-[#111318] text-white text-sm font-medium
                                rounded-md
                                border border-[#202225]
                                shadow-lg
                                whitespace-nowrap
                                pointer-events-none
                                opacity-0 group-hover:opacity-100
                                transition-opacity duration-200
                                z-50
                            "
                        >
                            {item.label}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom area (could be user avatar, settings, etc.) */}
            <div className="flex flex-col items-center">
                <div className="relative group">
                    <NavLink
                        to={PATHS.profile}
                        className={({ isActive }) => `
                            h-8 w-8 rounded-full
                            flex items-center justify-center
                            transition-all
                            ${
                                isActive
                                    ? "ring-2 ring-[#5865f2] ring-offset-2 ring-offset-[#111318]"
                                    : "hover:ring-2 hover:ring-[#26272d] hover:ring-offset-2 hover:ring-offset-[#111318]"
                            }
                        `}
                    >
                        <img
                            src={
                                user?.profilePicture || "https://www.gravatar.com/avatar/?d=mp&s=64"
                            }
                            alt={user?.username || "User Avatar"}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </NavLink>
                    {/* Tooltip */}
                    <div
                        className="
                            absolute left-full ml-3 top-1/2 -translate-y-1/2
                            px-3 py-1.5
                            bg-[#111318] text-white text-sm font-medium
                            rounded-md
                            border border-[#202225]
                            shadow-lg
                            whitespace-nowrap
                            pointer-events-none
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-200
                            z-50
                        "
                    >
                        Profile
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
