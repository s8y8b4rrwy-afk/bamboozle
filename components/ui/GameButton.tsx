import React from 'react';

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'gray' | 'red';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    children: React.ReactNode;
}

export const GameButton: React.FC<GameButtonProps> = ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {

    // Base styles
    const baseStyles = "relative font-black uppercase tracking-wide flex items-center justify-center transition-all duration-200 shadow-xl active:translate-y-2 active:shadow-none group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed";

    // Size variants
    const sizeStyles = {
        sm: "p-2 text-xs rounded-xl border-b-2",
        md: "p-4 text-lg rounded-2xl border-b-4",
        lg: "p-5 text-xl rounded-2xl border-b-4 md:border-b-8 md:rounded-[2rem]",
        xl: "p-6 md:p-8 text-2xl md:text-3xl rounded-3xl md:rounded-[2.5rem] border-b-4 md:border-b-8"
    };

    // Color variants
    const colorStyles = {
        primary: "bg-yellow-400 hover:bg-yellow-300 text-black border-yellow-600 hover:border-yellow-500",
        secondary: "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-md", // Keeping the 'glass' style as an option
        purple: "bg-purple-600 hover:bg-purple-500 text-white border-purple-800 hover:border-purple-700",
        blue: "bg-blue-600 hover:bg-blue-500 text-white border-blue-800 hover:border-blue-700",
        green: "bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-600 shadow-[0_10px_40px_-10px_rgba(34,197,94,0.6)]",
        pink: "bg-pink-600 hover:bg-pink-500 text-white border-pink-800 hover:border-pink-700",
        orange: "bg-orange-600 hover:bg-orange-500 text-white border-orange-800 hover:border-orange-700",
        gray: "bg-gray-700 hover:bg-gray-600 text-white border-gray-900 hover:border-gray-800",
        red: "bg-red-500 hover:bg-red-600 text-white border-red-700 hover:border-red-800",
    };

    return (
        <button
            className={`${baseStyles} ${sizeStyles[size]} ${colorStyles[variant]} ${className}`}
            {...props}
        >
            {/* Optional Shine Effect on Hover */}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-2">
                {children}
            </div>
        </button>
    );
};
