
import React from 'react';
import { MultiStepSignUp } from './MultiStepSignUp';

interface SignUpFormProps {
  onToggleMode: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleMode }) => {
  return <MultiStepSignUp onToggleMode={onToggleMode} />;
};
