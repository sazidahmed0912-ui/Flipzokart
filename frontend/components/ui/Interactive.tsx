import React from 'react';

interface InteractiveProps extends React.HTMLAttributes<HTMLElement> {
    as?: React.ElementType;
}

const Interactive: React.FC<InteractiveProps> = ({
    as: Component = 'div',
    children,
    className = '',
    ...props
}) => {
    return (
        <Component
            className={`
        transition-all 
        duration-300 
        ease-[cubic-bezier(0.22,1,0.36,1)] 
        hover:-translate-y-[1px] 
        active:scale-[0.98] 
        active:duration-75 
        cursor-pointer
        ${className}
      `}
            {...props}
        >
            {children}
        </Component>
    );
};

export default Interactive;
