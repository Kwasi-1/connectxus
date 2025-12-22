import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus } from "lucide-react";

type FilterType = "all" | "department" | "may-know";

interface PeopleFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function PeopleFilters({
  activeFilter,
  onFilterChange,
}: PeopleFiltersProps) {
  const filters = [
    { id: "all" as FilterType, label: "All People", icon: Users },
    { id: "department" as FilterType, label: "Your Department", icon: Users },
    {
      id: "may-know" as FilterType,
      label: "People You May Know",
      icon: UserPlus,
    },
  ];

  return (
    <div className="w-full">
      <div className="p-4 pl-6 space-y-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors ${
                  activeFilter === filter.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <filter.icon className="h-5 w-5" />
                <span>{filter.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
