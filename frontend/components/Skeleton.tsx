import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    borderRadius
}) => {
    const style: React.CSSProperties = {
        width: width,
        height: height,
        borderRadius: borderRadius,
    };

    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
};

export default Skeleton;
