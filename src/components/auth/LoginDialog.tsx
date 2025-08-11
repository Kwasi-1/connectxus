
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SignInForm } from '@/features/auth/SignInForm';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange }) => {
  const handleToggleMode = () => {
    // For now, we'll just close the dialog when switching to sign up
    // You can expand this later to show sign up form in the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login Required</DialogTitle>
          <DialogDescription>
            You need to log in to access this page. Please sign in to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <SignInForm onToggleMode={handleToggleMode} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
