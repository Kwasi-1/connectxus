
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import SelectInput from '@/components/shared/SelectInput';

interface StudentFieldsProps {
  control: Control<any>;
}

const levels = ['100', '200', '300', '400', '400+'];
const departments = [
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Business Administration', label: 'Business Administration' },
    { value: 'Economics', label: 'Economics' },
    { value: 'Psychology', label: 'Psychology' },
];

export const StudentFields: React.FC<StudentFieldsProps> = ({ control }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Level</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="department"
        render={({ field, fieldState: { error } }) => (
            <SelectInput
                id="department"
                label="Department"
                placeholder="Select your department"
                items={departments}
                onChange={field.onChange}
                errors={{ department: error?.message || '' }}
                touched={{ department: true }}
                values={{ department: field.value }}
            />
        )}
      />
    </div>
  );
};
