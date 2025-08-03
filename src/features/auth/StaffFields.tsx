
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';

interface StaffFieldsProps {
  control: Control<any>;
}

export const StaffFields: React.FC<StaffFieldsProps> = ({ control }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Institutional Email</FormLabel>
            <FormControl>
              <Input 
                type="email" 
                placeholder="Enter your institutional email" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <FormControl>
              <Input placeholder="Enter your department" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
