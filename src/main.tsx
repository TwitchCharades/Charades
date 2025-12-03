import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./styles/tailwind.css";
import "./styles/main.scss";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
    console.log(message);
});
