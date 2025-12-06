

interface GridProps {
    rows: number;
    columns: number;
    gap?: number;
    children: React.ReactNode;
}

interface GridItemProps {
    children: React.ReactNode;
}

export const Grid = ({ rows, columns, gap = 0, children }: GridProps) => {
    const gridStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
    };

    return <div style={gridStyle}>{children}</div>;
};

export const GridItem = ({ children }: GridItemProps) => {
    return <div>{children}</div>;
};