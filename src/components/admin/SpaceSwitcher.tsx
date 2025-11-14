import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { adminApi, type Space } from "@/api/admin.api";
import { Skeleton } from "@/components/ui/skeleton";

interface SpaceSwitcherProps {
  currentSpaceId?: string;
  onSpaceChange: (spaceId: string) => void;
  onCreateSpace: () => void;
}

export function SpaceSwitcher({
  currentSpaceId,
  onSpaceChange,
  onCreateSpace,
}: SpaceSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  const { data: spacesResponse, isLoading } = useQuery({
    queryKey: ["spaces"],
    queryFn: adminApi.getSpaces,
    staleTime: 5 * 60 * 1000,
  });

    const spaces = React.useMemo(() => {
    if (!spacesResponse) return [];

        try {
            if (
        spacesResponse.data?.spaces &&
        Array.isArray(spacesResponse.data.spaces)
      ) {
        return spacesResponse.data.spaces;
      }

            if (spacesResponse.spaces && Array.isArray(spacesResponse.spaces)) {
        return spacesResponse.spaces;
      }

            if (Array.isArray(spacesResponse)) {
        return spacesResponse;
      }

            if (spacesResponse.data && Array.isArray(spacesResponse.data)) {
        return spacesResponse.data;
      }

            for (const key in spacesResponse) {
        if (Array.isArray(spacesResponse[key])) {
          return spacesResponse[key];
        }
      }
    } catch (error) {
      console.error("Error parsing spaces response:", error);
    }

    return [];
  }, [spacesResponse]);

  const currentSpace = spaces.find(
    (space: Space) => space.id === currentSpaceId
  );

    const safeSpaces = Array.isArray(spaces) ? spaces : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between"
        >
          {isLoading ? (
            <Skeleton className="h-4 w-[180px]" />
          ) : currentSpace ? (
            <span className="truncate">{currentSpace.name}</span>
          ) : (
            "Select space..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search space..." />
          <CommandEmpty>No space found.</CommandEmpty>
          <CommandGroup>
            {safeSpaces.map((space: Space) => (
              <CommandItem
                key={space.id}
                value={space.name}
                onSelect={() => {
                  onSpaceChange(space.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentSpaceId === space.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{space.name}</span>
                  {space.slug && (
                    <span className="text-xs text-muted-foreground">
                      @{space.slug}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                onCreateSpace();
              }}
              className="text-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create new space
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
