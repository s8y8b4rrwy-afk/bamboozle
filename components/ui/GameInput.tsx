import React from 'react';

interface GameInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export const GameInput: React.FC<GameInputProps> = ({ className = '', ...props }) => {
    return (
        <input
            className={`w-full p-4 text-center text-3xl md:text-4xl font-black rounded-2xl uppercase tracking-[0.2em] bg-white text-black placeholder-gray-300 border-4 border-transparent focus:border-purple-500 outline-none transition-all shadow-xl focus:shadow-2xl ${className}`}
            {...props}
        />
    );
};
