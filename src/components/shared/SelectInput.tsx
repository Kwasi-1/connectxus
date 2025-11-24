import { cn } from "@/lib/utils";
import { Autocomplete, AutocompleteItem } from "@heroui/react";

export interface Items {
  value: string;
  label: string;
}
interface KSelectProps {
  placeholder?: string;
  items: Items[];
  label: string;
  onChange: (value: string) => void;
  errors?: Record<string, string>;
  id: string;
  extraClassName?: string;
  boldenLabel?: boolean;
  bgColor?: string;
  labelColor?: string;
  labelFontSize?: string;
  labelMarginBottom?: string;
  wrapperClassName?: string;
  touched?: Record<string, boolean>;
  values?: Record<string, any>;
  required?: boolean;
}
const SelectInput = ({
  placeholder,
  items,
  label,
  onChange,
  errors,
  id,
  touched,
  boldenLabel = false,
  bgColor = "bg-form-bg",
  labelColor = "text-foreground",
  labelFontSize = "text-sm",
  labelMarginBottom = "mb-2",
  wrapperClassName,
  values = {},
  required = false,
}: KSelectProps) => {
  const hasError = errors?.[id] && touched?.[id];

  return (
    <div className={cn("space-y-1", wrapperClassName)}>
      <p
        className={cn(
          "font-medium",
          labelColor,
          labelFontSize,
          labelMarginBottom
        )}
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </p>
      <Autocomplete
        id={id}
        placeholder={placeholder}
        inputProps={{
          classNames: {
            input: cn(
              "h-11 text-sm",
              "focus:ring-0 ring-0 outline-none",
              "placeholder:text-muted-foreground"
            ),
            inputWrapper: cn(
              "h-12 rounded-lg",
              "bg-background",
              "border-2 border-input",
              "hover:border-primary/50",
              "focus-within:border-primary",
              "transition-all duration-200",
              "shadow-sm hover:shadow-md",
              hasError && "border-red-500 focus-within:border-red-500"
            ),
          },
        }}
        popoverProps={{
          classNames: {
            content: cn(
              "rounded-lg border-2 border-border",
              "shadow-lg",
              "bg-background"
            ),
          },
        }}
        listboxProps={{
          itemClasses: {
            base: cn(
              "rounded-md",
              "data-[hover=true]:bg-accent",
              "data-[selectable=true]:focus:bg-accent",
              "transition-colors duration-150"
            ),
          },
        }}
        selectedKey={values[id]}
        aria-label={label}
        onSelectionChange={(k) => {
          onChange(k as string);
        }}
        isClearable={false}
      >
        {items.map((e) => {
          return (
            <AutocompleteItem
              key={e.value}
              className={cn(
                "text-foreground",
                "hover:text-foreground",
                "cursor-pointer"
              )}
            >
              {e.label}
            </AutocompleteItem>
          );
        })}
      </Autocomplete>

      {hasError && (
        <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
          <span className="inline-block">⚠</span>
          {errors?.[id]}
        </p>
      )}
    </div>
  );
};

export default SelectInput;
