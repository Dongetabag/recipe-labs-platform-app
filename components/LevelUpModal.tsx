import React from 'react';
// Fix: Add .tsx file extension for component import
import { Trophy } from './icons.tsx';

interface LevelUpModalProps {
  show: boolean;
  level: number;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ show, level, onClose }) => {
  return null;
};

export default LevelUpModal;