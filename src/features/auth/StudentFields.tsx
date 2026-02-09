import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Control, useWatch, useFormContext } from "react-hook-form";
import { spacesApi, departmentsApi, type Space, type Department } from "@/api";
import SelectInput from "@/components/shared/SelectInput";

interface StudentFieldsProps {
  control: Control<any>;
}

const levels = ["100", "200", "300", "400", "500", "600"];

export const StudentFields: React.FC<StudentFieldsProps> = ({ control }) => {
  const { setValue, getValues } = useFormContext();
  const selectedSpaceId = useWatch({
    control,
    name: "space_id",
  });

  const dept2 = useWatch({ control, name: "department_id_2" });
  const dept3 = useWatch({ control, name: "department_id_3" });

  const [showSecondDept, setShowSecondDept] = useState(!!dept2);
  const [showThirdDept, setShowThirdDept] = useState(!!dept3);

  useEffect(() => {
    if (dept2) setShowSecondDept(true);
    if (dept3) setShowThirdDept(true);
  }, [dept2, dept3]);

  const { data: spacesData, isLoading: isLoadingSpaces } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => spacesApi.getSpaces(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: departments, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments", selectedSpaceId],
    queryFn: () => departmentsApi.getDepartmentsBySpace(selectedSpaceId!),
    enabled: !!selectedSpaceId,
    staleTime: 5 * 60 * 1000,
  });

  const safeSpaces =
    spacesData && (spacesData as any).spaces ? (spacesData as any).spaces : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];

  const spaceItems = safeSpaces.map((space: Space) => ({
    value: space.id,
    label: space.name,
  }));

  const departmentItems = safeDepartments.map((dept: Department) => ({
    value: dept.id,
    label: dept.name,
  }));

  const dept1Value = useWatch({ control, name: "department_id" });

  const getFilteredDepartments = (currentValue: string | undefined) => {
    const selectedValues = [dept1Value, dept2, dept3].filter(Boolean);
    return departmentItems.filter(
      (item) =>
        item.value === currentValue || !selectedValues.includes(item.value),
    );
  };

  const handleAddSecond = () => setShowSecondDept(true);
  const handleRemoveSecond = () => {
    setShowSecondDept(false);
    setValue("department_id_2", "");
    setShowThirdDept(false);
    setValue("department_id_3", "");
  };

  const handleAddThird = () => setShowThirdDept(true);
  const handleRemoveThird = () => {
    setShowThirdDept(false);
    setValue("department_id_3", "");
  };

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

      <div className="space-y-3">
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
              items={getFilteredDepartments(field.value)}
              onChange={field.onChange}
              errors={{ department_id: error?.message || "" }}
              touched={{ department_id: true }}
              values={{ department_id: field.value }}
              required
            />
          )}
        />

        {!showSecondDept && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddSecond}
            className="text-primary hover:text-primary/80 h-auto p-0 font-normal"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add your second department
          </Button>
        )}

        {showSecondDept && (
          <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <FormField
                  control={control}
                  name="department_id_2"
                  render={({ field, fieldState: { error } }) => (
                    <SelectInput
                      id="department_id_2"
                      label="Second Department"
                      placeholder="Select second department"
                      items={getFilteredDepartments(field.value)}
                      onChange={field.onChange}
                      errors={{ department_id_2: error?.message || "" }}
                      touched={{ department_id_2: true }}
                      values={{ department_id_2: field.value }}
                    />
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemoveSecond}
                className="mb-0.5 h-10 w-10 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!showThirdDept && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddThird}
                className="text-primary hover:text-primary/80 h-auto p-0 font-normal mt-2"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add your third department
              </Button>
            )}
          </div>
        )}

        {showThirdDept && (
          <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <FormField
                  control={control}
                  name="department_id_3"
                  render={({ field, fieldState: { error } }) => (
                    <SelectInput
                      id="department_id_3"
                      label="Third Department"
                      placeholder="Select third department"
                      items={getFilteredDepartments(field.value)}
                      onChange={field.onChange}
                      errors={{ department_id_3: error?.message || "" }}
                      touched={{ department_id_3: true }}
                      values={{ department_id_3: field.value }}
                    />
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemoveThird}
                className="mb-0.5 h-10 w-10 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
};
