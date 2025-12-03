import { Outlet } from "react-router";
import { TitleBar } from "../components/titlebar";

const AuthLayout = () => {
    return (
        <div className="auth-layout">
            <TitleBar />
            <Outlet />
        </div>
    );
};

export default AuthLayout;
