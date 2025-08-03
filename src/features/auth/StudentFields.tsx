
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Control } from 'react-hook-form';

interface StudentFieldsProps {
  control: Control<any>;
}

const levels = ['100', '200', '300', '400', '400+'];

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

      <FormField
        control={control}
        name="wantsToBeTutor"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>I want to be a Tutor</FormLabel>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="wantsToBeMapMentor"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>I want to be a Mentor</FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};
