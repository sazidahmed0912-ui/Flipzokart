import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    ...props
}) => {
    const baseStyles = `
    relative 
    inline-flex 
    items-center 
    justify-center 
    font-medium 
    rounded-lg 
    transition-all 
    duration-300 
    ease-[cubic-bezier(0.22,1,0.36,1)] 
    focus:outline-none 
    focus:ring-2 
    focus:ring-offset-2 
    disabled:opacity-50 
    disabled:cursor-not-allowed
    hover:-translate-y-[1px]
    active:scale-[0.98]
    active:duration-75
  `;

    const variants = {
        primary: 'bg-[#ff7a00] text-white hover:bg-[#e66e00] focus:ring-[#ff7a00] shadow-sm hover:shadow-md',
        secondary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900 shadow-sm hover:shadow-md',
        outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    {/* Spinner removed */}
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
