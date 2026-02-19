import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    children,
    disabled,
    ...props
}) => {
    let baseStyle = "group relative transition-all duration-200 flex items-center justify-center font-black uppercase tracking-wide shadow-xl active:translate-y-2 active:border-b-0";

    // Size variants
    const sizeStyles = {
        sm: "px-4 py-2 text-xs md:text-sm rounded-xl border-b-[4px]",
        md: "px-6 py-3 md:py-4 text-sm md:text-lg rounded-2xl md:rounded-[1.5rem] border-b-[6px]",
        lg: "p-4 md:p-6 text-lg md:text-2xl rounded-3xl md:rounded-[2rem] border-b-[8px]",
        xl: "p-6 md:p-8 text-xl md:text-3xl rounded-3xl md:rounded-[2.5rem] border-b-[8px]",
    };

    // Color variants
    const variantStyles = {
        primary: "bg-yellow-400 hover:bg-yellow-300 text-black border-yellow-600 hover:border-yellow-500",
        secondary: "bg-purple-600 hover:bg-purple-500 text-white border-purple-800 hover:border-purple-700",
        danger: "bg-red-600 hover:bg-red-500 text-white border-red-800 hover:border-red-700",
        success: "bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-600",
        outline: "bg-transparent hover:bg-white/10 text-white border-white/40 hover:border-white/60 border-2 shadow-none active:translate-y-0 active:scale-95",
        ghost: "bg-transparent text-white/50 hover:text-white border-transparent shadow-none active:translate-y-0 hover:bg-white/5",
    };

    const disabledStyles = disabled ? "opacity-50 grayscale cursor-not-allowed transform-none active:translate-y-0 active:border-b-[4px] md:active:border-b-[8px]" : "";
    const widthStyle = fullWidth ? "w-full" : "";

    // Adjust active state border reset based on size since outline/ghost don't use it the same way
    if (variant === 'outline' || variant === 'ghost') {
        baseStyle = "group relative transition-all duration-200 flex items-center justify-center font-black uppercase tracking-wide";
    }

    return (
        <button
            className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${disabledStyles} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};
