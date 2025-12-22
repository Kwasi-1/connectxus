import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, useWatch } from "react-hook-form";
import { spacesApi, departmentsApi, type Space, type Department } from "@/api";
import SelectInput from "@/components/shared/SelectInput";

interface StaffFieldsProps {
  control: Control<any>;
}


export const StaffFields: React.FC<StaffFieldsProps>= ({ control }) => {
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

  const spaceItems = safeSpaces.map((space: Space) => ({
    value: space.id,
    label: space.name,
  }));

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
