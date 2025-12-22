import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertCircle, Smartphone } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface PaymentInfo {
  payment_method?: string;
  mobile_money_network?: string;
  account_number?: string;
  account_name?: string;
}

interface RequestPayoutModalProps {
  open: boolean;
  onClose: () => void;
  paymentInfo?: PaymentInfo | null;
  amount: number;
  onConfirm: () => void;
  isLoading: boolean;
}

export function RequestPayoutModal({
  open,
  onClose,
  paymentInfo,
  amount,
  onConfirm,
  isLoading,
}: RequestPayoutModalProps) {
  const { formatCurrency } = useCurrency();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Request Payout
          </DialogTitle>
          <DialogDescription>
            Confirm payout request for {formatCurrency(amount)}
          </DialogDescription>
        </DialogHeader>

        {paymentInfo ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-3">
              <div className="flex items-center gap-2 font-medium">
                {paymentInfo.payment_method === 'mobile_money' ? (
                  <Smartphone className="h-4 w-4" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                <span className="capitalize">
                  {paymentInfo.payment_method?.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {paymentInfo.account_name && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Account Name:</span>
                    <span className="font-medium">{paymentInfo.account_name}</span>
                  </div>
                )}

                {paymentInfo.mobile_money_network && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="font-medium">{paymentInfo.mobile_money_network}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-medium">{paymentInfo.account_number}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-blue-900 dark:text-blue-100">
                  <p className="font-medium mb-1">Payout Processing</p>
                  <p className="text-xs">
                    Payouts are processed bi-weekly. Funds will be sent to your account
                    within 2-3 business days after approval.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950 p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Amount to receive</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(amount)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive">
                Please add your payment information before requesting a payout.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!paymentInfo || isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
