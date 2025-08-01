
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  variant?: 'post' | 'compose';
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  variant = 'post',
  className 
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg z-50 md:hidden",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "transition-all duration-200 hover:scale-105",
        className
      )}
      size="icon"
    >
      {variant === 'post' ? (
        <Plus className="h-6 w-6" />
      ) : (
        <Edit3 className="h-6 w-6" />
      )}
    </Button>
  );
}
