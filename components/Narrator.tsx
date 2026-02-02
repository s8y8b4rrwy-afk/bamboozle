
import React from 'react';
import { Avatar } from './Avatar';
import { NARRATOR_SEED } from '../constants';

interface NarratorProps {
  isSpeaking: boolean;
  className?: string;
  size?: number;
}

export const Narrator: React.FC<NarratorProps> = ({ isSpeaking, className, size = 80 }) => {
  return (
    <div className={className}>
      <div className="relative">
        <Avatar
          seed={NARRATOR_SEED}
          size={size}
          speaking={isSpeaking}
          expression={isSpeaking ? 'HAPPY' : 'NEUTRAL'}
          className="filter drop-shadow-2xl"
        />
      </div>
    </div>
  );
};
