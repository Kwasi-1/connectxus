import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAccountDetail,
  updateAccountDetail,
} from "@/api/accounts.api";
import { toast } from "sonner";
import { CreditCard, Smartphone } from "lucide-react";
import type { AccountDetail } from "@/types/accounts";

const accountSchema = z
  .object({
    account_type: z.enum(["mobile_money", "bank"], {
      required_error: "Please select an account type",
    }),
    mobile_money_network: z.string().optional(),
    account_number: z.string().min(5, "Please provide a valid account number"),
    account_name: z.string().min(2, "Please provide account name"),
  })
  .refine(
    (data) => {
      if (data.account_type === "mobile_money") {
        return !!data.mobile_money_network;
      }
      return true;
    },
    {
      message: "Please select a mobile money network",
      path: ["mobile_money_network"],
    }
  );

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  accounts: AccountDetail[];
  currentAccount?: AccountDetail;
}

export function AccountModal({ open, onClose, accounts, currentAccount }: AccountModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!currentAccount;

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      account_type: "mobile_money",
      mobile_money_network: "",
      account_number: "",
      account_name: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (currentAccount) {
        form.reset({
          account_type: currentAccount.account_type,
          mobile_money_network: currentAccount.mobile_money_network || "",
          account_number: currentAccount.account_number,
          account_name: currentAccount.account_name,
        });
      } else {
        form.reset({
          account_type: "mobile_money",
          mobile_money_network: "",
          account_number: "",
          account_name: "",
        });
      }
    }
  }, [open, currentAccount, form]);

  const mutation = useMutation({
    mutationFn: (data: AccountFormData) => {
      if (isEditing && currentAccount?.id) {
        return updateAccountDetail(currentAccount.id, data);
      }
      return createAccountDetail(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-details"] });
      toast.success(
        isEditing
          ? "Account updated successfully"
          : "Account created successfully"
      );
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          `Failed to ${isEditing ? "update" : "create"} account`
      );
    },
  });

  const handleSubmit = (data: AccountFormData) => {
    mutation.mutate(data);
  };

  const accountType = form.watch("account_type");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {isEditing ? "Update" : "Create"} Payout Account
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your payout account details"
              : "Add a new payout account to receive your earnings"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="account_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mobile_money">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Mobile Money
                        </div>
                      </SelectItem>
                      <SelectItem value="bank">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Bank Account
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account holder's name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Full name as it appears on the account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {accountType === "mobile_money" && (
              <FormField
                control={form.control}
                name="mobile_money_network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Money Network</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                        <SelectItem value="Vodafone">Vodafone Cash</SelectItem>
                        <SelectItem value="AirtelTigo">
                          AirtelTigo Money
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select your mobile money provider
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {accountType === "mobile_money"
                      ? "Mobile Money Number"
                      : "Account Number"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        accountType === "mobile_money"
                          ? "0244123456"
                          : "Enter account number"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {accountType === "mobile_money"
                      ? "Enter your mobile money number"
                      : "Enter your bank account number"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">Payout Schedule</p>
              <p className="text-muted-foreground">
                Payouts are processed bi-weekly. Funds will be sent to your
                provided account within 2-3 business days after each payout
                date.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? "Saving..."
                  : isEditing
                  ? "Update Account"
                  : "Create Account"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
