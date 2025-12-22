import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { updateTutorPaymentInfo, TutorPaymentInfo } from "@/api/tutoring.api";
import { toast as sonnerToast } from "sonner";
import { CreditCard, Smartphone } from "lucide-react";

const paymentInfoSchema = z
  .object({
    payment_method: z.enum(["mobile_money", "bank_account"], {
      required_error: "Please select a payment method",
    }),
    mobile_money_network: z.string().optional(),
    account_number: z.string().min(5, "Please provide a valid account number"),
    account_name: z.string().min(2, "Please provide account name"),
  })
  .refine(
    (data) => {
      if (data.payment_method === "mobile_money") {
        return !!data.mobile_money_network;
      }
      return true;
    },
    {
      message: "Please select a mobile money network",
      path: ["mobile_money_network"],
    }
  );

type PaymentInfoFormData = z.infer<typeof paymentInfoSchema>;

interface UpdatePaymentInfoModalProps {
  open: boolean;
  onClose: () => void;
  currentInfo?: TutorPaymentInfo & { account_name?: string };
  serviceId?: string;
}

export function UpdatePaymentInfoModal({
  open,
  onClose,
  currentInfo,
  serviceId,
}: UpdatePaymentInfoModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<PaymentInfoFormData>({
    resolver: zodResolver(paymentInfoSchema),
    defaultValues: {
      payment_method: currentInfo?.payment_method || "mobile_money",
      mobile_money_network: currentInfo?.mobile_money_network || "",
      account_number: currentInfo?.account_number || "",
      account_name: currentInfo?.account_name || currentInfo?.account_number || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PaymentInfoFormData) => {
      if (!serviceId) throw new Error("Service ID is required");
      return updateTutorPaymentInfo(serviceId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tutor-service-details", serviceId],
      });
      queryClient.invalidateQueries({ queryKey: ["tutor-services"] });
      sonnerToast.success("Payment information updated successfully");
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Failed to update payment information"
      );
    },
  });

  const handleSubmit = (data: PaymentInfoFormData) => {
    updateMutation.mutate(data);
  };

  const paymentMethod = form.watch("payment_method");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Update Payment Information
          </DialogTitle>
          <DialogDescription>
            Update your payout details to receive your earnings
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mobile_money">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Mobile Money
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_account">
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
                    <Input placeholder="Enter account name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Name on the account (required)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentMethod === "mobile_money" && (
              <FormField
                control={form.control}
                name="mobile_money_network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Money Network</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                    {paymentMethod === "mobile_money"
                      ? "Mobile Money Number"
                      : "Account Number"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        paymentMethod === "mobile_money"
                          ? "0244123456"
                          : "Enter account number"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {paymentMethod === "mobile_money"
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
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Payment Info"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
