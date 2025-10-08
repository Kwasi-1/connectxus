import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminGroup } from "@/data/mockAdminCommunitiesData";

interface SuspendGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AdminGroup | null;
  onConfirm: () => void;
}

export function SuspendGroupDialog({
  open,
  onOpenChange,
  group,
  onConfirm,
}: SuspendGroupDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspend Group</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to suspend "{group?.name}"? This action will
            make the group inactive and prevent new members from joining.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Suspend Group
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
