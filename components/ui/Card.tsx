import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'primary',
    padding = 'md'
}) => {

    const variantStyles = {
        primary: "bg-white text-black border-b-[6px] md:border-b-[8px] border-gray-200 shadow-[0_20px_60px_-15px_rgba(255,255,255,0.4)]",
        secondary: "bg-indigo-950 border-4 border-yellow-400 shadow-[4px_4px_0px_0px_#FACC15] text-white",
        glass: "bg-black/40 backdrop-blur-xl border border-white/10 text-white shadow-2xl",
    };

    const paddingStyles = {
        none: "p-0",
        sm: "p-3 md:p-4",
        md: "p-4 md:p-8",
        lg: "p-6 md:p-14 pt-10 pb-8", // Specific for Reveal
    };

    const baseStyles = "rounded-2xl md:rounded-[2.5rem] flex flex-col items-center relative transition-colors duration-500 overflow-hidden";

    return (
        <div className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}>
            {children}
        </div>
    );
};
