
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserRole } from '@/types/auth';
import { getRoleDisplayName } from '@/lib/role';
import { Control } from 'react-hook-form';

interface RoleSelectorProps {
  control: Control<any>;
  name: string;
}

const availableRoles: UserRole[] = ['student', 'ta', 'lecturer'];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ control, name }) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Who are you?</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {getRoleDisplayName(role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
