
import React from 'react';
import { FormField } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import SelectInput from '@/components/shared/SelectInput';

interface StaffFieldsProps {
  control: Control<any>;
}

const departments = [
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Business Administration', label: 'Business Administration' },
    { value: 'Economics', label: 'Economics' },
    { value: 'Psychology', label: 'Psychology' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Finance', label: 'Finance' },
];

export const StaffFields: React.FC<StaffFieldsProps> = ({ control }) => {
  return (
    <div className="space-y-4">
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
