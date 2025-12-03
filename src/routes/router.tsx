import { createBrowserRouter, redirect } from "react-router";
import { PATHS } from "./paths";

// Layouts
import { DefaultLayout, AuthLayout } from "../layout";

// Pages
import { HomePage } from "../pages/home";
import { AuthPage } from "../pages/auth";
import { ProfilePage } from "../pages/profile";
import { SettingsPage } from "../pages/settings";

const isAuthenticated = async (): Promise<boolean> => {
    if (window.electronAPI?.auth) {
        try {
            const result = await window.electronAPI.auth.check();
            return result.authenticated;
        } catch (error) {
            console.error("Failed to check auth status:", error);
            return false;
        }
    }
    return false;
};

const authLoader = async () => {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        return redirect(PATHS.auth);
    }
    return null;
};

const publicLoader = async () => {
    const authenticated = await isAuthenticated();
    if (authenticated) {
        return redirect(PATHS.home);
    }
    return null;
};

export const router = createBrowserRouter([
    {
        path: PATHS.home,
        element: <DefaultLayout />,
        loader: authLoader,
        children: [
            {
                index: true,
                path: PATHS.home,
                element: <HomePage />,
            },
            {
                path: PATHS.profile,
                element: <ProfilePage />,
            },
            {
                path: PATHS.settings,
                element: <SettingsPage />,
            },
        ],
    },
    {
        element: <AuthLayout />,
        loader: publicLoader,
        children: [
            {
                index: true,
                path: PATHS.auth,
                element: <AuthPage />,
            },
        ],
    },
]);
