import { ToastContainer, toast } from "react-toastify";
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import "./toaster.scss"

export const toaster = {
    success: (message: string) =>
        toast.success(message, {
            className: "toast-success",
            progressClassName: "toast-progress-success",
        }),

    error: (message: string) =>
        toast.error(message, {
            className: "toast-error",
            progressClassName: "toast-progress-error",
        }),

    info: (message: string) =>
        toast.info(message, {
            className: "toast-info",
            progressClassName: "toast-progress-info",
        }),

    warning: (message: string) =>
        toast.warning(message, {
            className: "toast-warning",
            progressClassName: "toast-progress-warning",
        }),
};

const Toaster: React.FC = () => {
    return (
        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastStyle={{
                backgroundColor: "#1c1d24",
                color: "#ffffff",
            }}
        />
    );
};

export default Toaster;