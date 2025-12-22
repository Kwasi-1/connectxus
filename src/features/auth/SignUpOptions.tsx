import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Control, useWatch } from "react-hook-form";

interface SignUpOptionsProps {
  control: Control<any>;
}

export const SignUpOptions: React.FC<SignUpOptionsProps> = ({ control }) => {
  const role = useWatch({ control, name: "role" });

  if (role === "student") {
    return null;
  }

  return <div className="space-y-4"></div>;
};
