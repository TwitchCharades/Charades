import { Outlet } from "react-router";
import { TitleBar } from "../components/titlebar";

const DefaultLayout = () => {
    return (
        <div className="default-layout">
            <TitleBar />
            <Outlet />
        </div>
    );
};

export default DefaultLayout;
