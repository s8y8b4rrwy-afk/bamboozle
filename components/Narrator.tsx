
import React from 'react';
import { Avatar } from './Avatar';
import { NARRATOR_SEED } from '../constants';

interface NarratorProps {
  isSpeaking: boolean;
  className?: string;
}

export const Narrator: React.FC<NarratorProps> = ({ isSpeaking, className }) => {
  return (
    <div className={className}>
      <div className="relative">
        {/* Speech bubble or indicator could go here */}
        <Avatar
          seed={NARRATOR_SEED}
          size={80}
          speaking={isSpeaking}
          expression={isSpeaking ? 'HAPPY' : 'NEUTRAL'}
          className="filter drop-shadow-2xl"
        />
      </div>
    </div>
  );
};
