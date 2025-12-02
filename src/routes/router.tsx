import { createBrowserRouter } from 'react-router';
import { PATHS } from './paths';

// Layouts
import { DefaultLayout, AuthLayout } from '../layout';

// Pages
import { HomePage } from '../pages/home';
import { AuthPage } from '../pages/auth';
import { ProfilePage } from '../pages/profile';
import { SettingsPage } from '../pages/settings';



export const router = createBrowserRouter([
    {
        path: PATHS.home,
        element: <DefaultLayout />,
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
        children: [
            {
                index: true,
                path: PATHS.auth,
                element: <AuthPage />,
            },
        ],
    },
]);
