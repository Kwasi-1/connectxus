import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control, useWatch } from "react-hook-form";
import { spacesApi, departmentsApi, type Space, type Department } from "@/api";
import SelectInput from "@/components/shared/SelectInput";

interface StudentFieldsProps {
  control: Control<any>;
}

const levels = ["100", "200", "300", "400", "400+"];

export const StudentFields: React.FC<StudentFieldsProps> = ({ control }) => {
  const selectedSpaceId = useWatch({
    control,
    name: "space_id",
  });

  const { data: spacesData, isLoading: isLoadingSpaces } = useQuery({
    queryKey: ["spaces"],
    queryFn: spacesApi.getSpaces,
    staleTime: 5 * 60 * 1000,
  });

  const { data: departments, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments", selectedSpaceId],
    queryFn: () => departmentsApi.getDepartmentsBySpace(selectedSpaceId!),
    enabled: !!selectedSpaceId,
    staleTime: 5 * 60 * 1000,
  });

  const safeSpaces =
    spacesData && spacesData.spaces.length > 0 ? spacesData.spaces : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];

  // Transform spaces to SelectInput format
  const spaceItems = safeSpaces.map((space: Space) => ({
    value: space.id,
    label: space.name,
  }));

  // Transform departments to SelectInput format
  const departmentItems = safeDepartments.map((dept: Department) => ({
    value: dept.id,
    label: dept.name,
  }));

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="space_id"
        render={({ field, fieldState: { error } }) => (
          <SelectInput
            id="space_id"
            label="University"
            placeholder={
              isLoadingSpaces ? "Loading..." : "Select your university"
            }
            items={spaceItems}
            onChange={field.onChange}
            errors={{ space_id: error?.message || "" }}
            touched={{ space_id: true }}
            values={{ space_id: field.value }}
            required
          />
        )}
      />

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
        name="department_id"
        render={({ field, fieldState: { error } }) => (
          <SelectInput
            id="department_id"
            label="Department"
            placeholder={
              !selectedSpaceId
                ? "Select a university first..."
                : isLoadingDepartments
                ? "Loading..."
                : "Select your department"
            }
            items={departmentItems}
            onChange={field.onChange}
            errors={{ department_id: error?.message || "" }}
            touched={{ department_id: true }}
            values={{ department_id: field.value }}
            required
          />
        )}
      />
    </div>
  );
};
