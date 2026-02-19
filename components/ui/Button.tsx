import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'flat' | 'outline' | 'ghost';
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
    // Size variants — flat style, rounded-xl, no border-bottom 3D trick
    const sizeStyles: Record<string, string> = {
        sm: "px-4 py-2 text-xs md:text-sm rounded-xl",
        md: "px-6 py-3 text-sm md:text-base rounded-xl",
        lg: "px-6 py-4 text-base md:text-lg rounded-xl",
        xl: "px-8 py-5 text-lg md:text-xl rounded-xl",
    };

    // Color variants — flat, no border-bottom colors needed
    const variantStyles: Record<string, string> = {
        primary: "bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black",
        secondary: "bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white",
        danger: "bg-red-600 hover:bg-red-500 active:bg-red-700 text-white",
        success: "bg-green-500 hover:bg-green-400 active:bg-green-600 text-white",
        flat: "bg-green-500 hover:bg-green-400 active:bg-green-600 text-white",
        outline: "bg-transparent hover:bg-white/10 text-white border-2 border-white/40 hover:border-white/60 shadow-none",
        ghost: "bg-transparent text-white/50 hover:text-white hover:bg-white/5 shadow-none",
    };

    const baseStyle = "relative transition-all duration-150 flex items-center justify-center font-black uppercase tracking-wide shadow-xl active:scale-95 active:brightness-90 select-none";
    const disabledStyles = disabled ? "opacity-50 grayscale cursor-not-allowed active:scale-100 active:brightness-100" : "";
    const widthStyle = fullWidth ? "w-full" : "";

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
