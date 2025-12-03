import { Outlet } from "react-router";
import { TitleBar } from "../components/titlebar";

export interface DefaultLayoutProps {
    title?: string;
    icon?: any; // LineIcons IconData type
}

const DefaultLayout = ({ title, icon }: DefaultLayoutProps) => {
    return (
        <>
            <div className="w-screen h-screen flex flex-col bg-[#111318] text-(--text-primary)">
                <TitleBar title={title} icon={icon} />

                <div className="flex-1 overflow-hidden">
                    <div className="w-full h-full overflow-y-auto custom-scrollbar">
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    );
};

export default DefaultLayout;
