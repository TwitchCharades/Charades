type variant = "primary" | "secondary" | "tertiary";


interface ButtonProps {
    label?: string;
    onClick: () => void;
    variant?: variant;
    disabled?: boolean;
    children?: React.ReactNode;
    icon?: React.ReactNode;
}


const Button = ({ label, onClick, variant = "primary", disabled = false, children, icon }: ButtonProps) => {
    const baseClasses = "relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing.3)-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] sm:text-sm/6 focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[disabled]:opacity-50";
    
    const variantClasses = {
        primary: "border-transparent bg-zinc-950 text-white data-[hover]:bg-zinc-800 data-[focus]:outline-zinc-950 dark:bg-white dark:text-zinc-950 dark:data-[hover]:bg-zinc-200 dark:data-[focus]:outline-white",
        secondary: "border-zinc-950/10 text-zinc-950 data-[hover]:bg-zinc-950/[2.5%] data-[focus]:outline-zinc-950 dark:border-white/15 dark:text-white dark:data-[hover]:bg-white/[2.5%] dark:data-[focus]:outline-white",
        tertiary: "border-transparent text-zinc-950 data-[hover]:bg-zinc-950/5 data-[focus]:outline-zinc-950 dark:text-white dark:data-[hover]:bg-white/5 dark:data-[focus]:outline-white"
    };
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses}`}
            disabled={disabled}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {children || label}
        </button>
    );
};

export default Button;