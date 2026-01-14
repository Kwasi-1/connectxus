import { useState, useEffect } from "react";
import { X, Check, Users, Building2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  mockCommunities,
  mockGroups,
  getSavedAudienceSelection,
  saveAudienceSelection,
} from "@/utils/newStoryStorage";
import { AudienceType } from "@/types/storyTypes";

interface ShareToSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: AudienceType, ids: string[]) => void;
}

export const ShareToSelector = ({
  isOpen,
  onClose,
  onSelect,
}: ShareToSelectorProps) => {
  const [audienceType, setAudienceType] = useState<AudienceType>("following");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedAudienceSelection();
      setAudienceType(saved.type);
      setSelectedIds(saved.ids);
    }
  }, [isOpen]);

  const handleTypeSelect = (type: AudienceType) => {
    setAudienceType(type);
    if (type === "community" || type === "group") {
      setShowSelectionModal(true);
    } else {
      // Following doesn't need selection
      setSelectedIds([]);
      handleConfirm(type, []);
    }
  };

  const handleConfirm = (type: AudienceType, ids: string[]) => {
    saveAudienceSelection(type, ids);
    onSelect(type, ids);
    setShowSelectionModal(false);
    onClose();
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const items = audienceType === "community" ? mockCommunities : mockGroups;

  return (
    <>
      {/* Main Share To Selector */}
      <Dialog open={isOpen && !showSelectionModal} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Share To</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <button
              onClick={() => handleTypeSelect("following")}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all hover:scale-[1.02] flex items-center gap-4",
                audienceType === "following"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="p-3 rounded-full bg-primary/20">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Following</p>
                <p className="text-sm text-muted-foreground">
                  Share with people you follow
                </p>
              </div>
              {audienceType === "following" && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </button>

            <button
              onClick={() => handleTypeSelect("community")}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all hover:scale-[1.02] flex items-center gap-4",
                audienceType === "community"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="p-3 rounded-full bg-primary/20">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Community</p>
                <p className="text-sm text-muted-foreground">
                  {selectedIds.length > 0 && audienceType === "community"
                    ? `${selectedIds.length} selected`
                    : "Select communities"}
                </p>
              </div>
              {audienceType === "community" && selectedIds.length > 0 && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </button>

            <button
              onClick={() => handleTypeSelect("group")}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all hover:scale-[1.02] flex items-center gap-4",
                audienceType === "group"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="p-3 rounded-full bg-primary/20">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Group</p>
                <p className="text-sm text-muted-foreground">
                  {selectedIds.length > 0 && audienceType === "group"
                    ? `${selectedIds.length} selected`
                    : "Select groups"}
                </p>
              </div>
              {audienceType === "group" && selectedIds.length > 0 && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Community/Group Selection Modal */}
      <Dialog open={showSelectionModal} onOpenChange={setShowSelectionModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Select {audienceType === "community" ? "Communities" : "Groups"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-4">
            <div className="space-y-2 py-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleSelection(item.id)}
                  className={cn(
                    "w-full p-3 rounded-lg border transition-all hover:scale-[1.01] flex items-center gap-3",
                    selectedIds.includes(item.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={item.avatar} alt={item.name} />
                    <AvatarFallback>
                      {item.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.memberCount.toLocaleString()} members
                    </p>
                  </div>
                  {selectedIds.includes(item.id) && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowSelectionModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleConfirm(audienceType, selectedIds)}
              disabled={selectedIds.length === 0}
              className="flex-1"
            >
              Confirm ({selectedIds.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
