import { Outlet } from "react-router";

const DefaultLayout = () => {
    return (
        <div className="default-layout">
            <Outlet />
        </div>
    );
}

export default DefaultLayout;