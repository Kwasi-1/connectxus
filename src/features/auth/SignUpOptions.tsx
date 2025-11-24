
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Control, useWatch } from 'react-hook-form';

interface SignUpOptionsProps {
  control: Control<any>;
}

export const SignUpOptions: React.FC<SignUpOptionsProps> = ({ control }) => {
  const role = useWatch({ control, name: 'role' });

  if (role === 'student') {
    return null;
  }

  return (
    <div className="space-y-4">
        <FormField
            control={control}
            name="wantsToBeTutor"
            render={({ field }) => (
            <FormItem className="">
                <FormControl>
                <button className={`${field.value ? "bg-accent" : ""} flex flex-row w-full items-start justify-start space-x-3 space-y-0 rounded-md border p-4`} onClick={() => field.onChange(!field.value)}>
                    <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">I want to be a Tutor</FormLabel>
                    <p className="text-xs text-muted-foreground">
                        Help other students with academic subjects
                    </p>
                    </div>
                </button>
                </FormControl>

            </FormItem>
            )}
        />

        <FormField
            control={control}
            name="wantsToBeMentor"
            render={({ field }) => (
                <FormItem className="">
                <FormControl>
                  <button className={`${field.value ? "bg-accent" : ""} flex flex-row w-full items-start justify-start space-x-3 space-y-0 rounded-md border p-4`} onClick={() => field.onChange(!field.value)}>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">I want to be a Mentor</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Guide students in career and personal development
                      </p>
                    </div>
                  </button>
                </FormControl>
    
              </FormItem>
            )}
        />
    </div>
  );
};
