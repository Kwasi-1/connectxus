import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
}

interface DepartmentSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

export const DepartmentSelect = ({
  value,
  onChange,
  className,
  label = "Department",
}: DepartmentSelectProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apiClient.get("/users/me/departments");
        const data = response.data.data;
        if (Array.isArray(data)) {
          setDepartments(data);
          if (!value && data.length > 0) {
            onChange(data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch departments", error);
        toast.error("Failed to load your departments");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [value, onChange]);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading departments...
      </div>
    );
  }

  if (departments.length === 0) {
    return null; 
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a department" />
        </SelectTrigger>
        <SelectContent>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
