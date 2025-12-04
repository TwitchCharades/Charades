import { router } from "./routes/router";
import { RouterProvider } from "react-router";
import { useEffect } from "react";

const App = () => {
    useEffect(() => {
        // Listen for auth success from main process
        const handleAuthSuccess = (_event: any, userData: any) => {
            console.log("Auth success received, navigating to home", userData);
            router.navigate("/");
        };

        if (window.ipcRenderer) {
            window.ipcRenderer.on("twitch:auth:success", handleAuthSuccess);

            return () => {
                window.ipcRenderer.off("twitch:auth:success", handleAuthSuccess);
            };
        }
    }, []);

    return <RouterProvider router={router} />;
};

export default App;
