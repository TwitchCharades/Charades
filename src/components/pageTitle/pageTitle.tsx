interface PageTitleProps {
    title: string;
    subtitle?: string;
    photoIconUrl?: string;
}

const PageTitle = ({ title, subtitle, photoIconUrl }: PageTitleProps) => {
    return (
        <div className="flex items-center gap-4 mb-4">
            {photoIconUrl && (
                <img
                    src={photoIconUrl}
                    alt="Icon"
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                />
            )}
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold leading-tight">{title}</h1>
                {subtitle && <h2 className="text-lg text-gray-300 leading-tight">{subtitle}</h2>}
            </div>
        </div>
    );
}

export default PageTitle;
