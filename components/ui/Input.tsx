import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    variant?: 'default' | 'transparent';
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    className = '',
    variant = 'default',
    error,
    ...props
}, ref) => {

    const baseStyles = "w-full outline-none transition-all uppercase placeholder-gray-400 shadow-inner";

    const variantStyles = {
        default: "bg-white text-black border-4 border-transparent focus:border-yellow-400 rounded-xl md:rounded-2xl",
        transparent: "bg-black/20 text-white focus:ring-2 focus:ring-yellow-400 placeholder-white/30 rounded-xl"
    };

    const errorStyles = error ? "border-red-500 focus:border-red-500" : "";

    return (
        <div className="w-full relative">
            <input
                ref={ref}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                className={`${baseStyles} ${variantStyles[variant]} ${errorStyles} ${className}`}
                {...props}
            />
        </div>
    );
});

Input.displayName = 'Input';
