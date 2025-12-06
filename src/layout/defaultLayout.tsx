import { Outlet } from "react-router";
import { TitleBar } from "../components/titlebar";
import { SideBar } from "../components/sidebar";
import { ToasterContainer } from "../components/toaster";

export interface DefaultLayoutProps {
    title?: string;
    icon?: any;
}

const DefaultLayout = ({ title, icon }: DefaultLayoutProps) => {
    return (
        <>
            <div className="w-screen h-screen flex flex-col bg-[#111318] text-[var(--text-primary)]">
                <TitleBar title={title} icon={icon} />

                <div className="flex-1 flex overflow-hidden">
                    <SideBar />

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="w-full max-w-6xl mx-auto px-4 py-6">
                            <Outlet />
                        </div>
                    </div>
                </div>
                <ToasterContainer />
            </div>
        </>
    );
};

export default DefaultLayout;
