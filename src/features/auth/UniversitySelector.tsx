
import React from 'react';
import { FormField } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import SelectInput from '@/components/shared/SelectInput';

interface UniversitySelectorProps {
  control: Control<any>;
  name: string;
}

const universities = [
  'University of Ghana',
  'Kwame Nkrumah University of Science and Technology',
  'University of Cape Coast',
  'University of Education, Winneba',
  'University for Development Studies',
];

const universityItems = universities.map(uni => ({ value: uni, label: uni }));

export const UniversitySelector: React.FC<UniversitySelectorProps> = ({ control, name }) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <SelectInput
          id={name}
          label="University"
          placeholder="Select your university"
          items={universityItems}
          onChange={field.onChange}
          errors={{ [name]: error?.message || '' }}
          touched={{ [name]: true }}
          values={{ [name]: field.value }}
          required
        />
      )}
    />
  );
};
