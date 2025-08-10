
import React from 'react';
import { Control, useController } from 'react-hook-form';
import { SignUpFormData, UserInterest } from '@/types/auth';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InterestsSelectorProps {
  control: Control<SignUpFormData>;
  name: keyof SignUpFormData;
}

const INTERESTS: { value: UserInterest; label: string }[] = [
  { value: 'technology', label: 'Technology' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'research', label: 'Research' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'arts', label: 'Arts' },
  { value: 'sports', label: 'Sports' },
  { value: 'music', label: 'Music' },
  { value: 'photography', label: 'Photography' },
  { value: 'writing', label: 'Writing' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'travel', label: 'Travel' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'fitness', label: 'Fitness' },
];

export const InterestsSelector: React.FC<InterestsSelectorProps> = ({ control, name }) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const { field: controllerField } = useController({
          name,
          control,
          defaultValue: [],
        });

        const selectedInterests = controllerField.value as UserInterest[] || [];

        const toggleInterest = (interest: UserInterest) => {
          const isSelected = selectedInterests.includes(interest);
          const newInterests = isSelected
            ? selectedInterests.filter(i => i !== interest)
            : [...selectedInterests, interest];
          controllerField.onChange(newInterests);
        };

        return (
          <FormItem>
            <FormLabel>Select topics you're interested in (choose at least one)</FormLabel>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest.value);
                return (
                  <Button
                    key={interest.value}
                    type="button"
                    variant="outline"
                    onClick={() => toggleInterest(interest.value)}
                    className={cn(
                      "h-12 text-sm font-medium transition-all duration-200",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {interest.label}
                  </Button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
