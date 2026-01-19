import { useState, useEffect } from "react";
import { X, Check, Users, Building2, UserPlus, Globe } from "lucide-react";
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
import { getUserCommunities } from "@/api/communities.api";
import { getUserGroups } from "@/api/groups.api";
import { AudienceType } from "@/types/storyTypes";

interface ShareToSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: AudienceType, ids: string[]) => void;
  currentAudienceType?: AudienceType;
  currentAudienceIds?: string[];
}

export const ShareToSelector = ({
  isOpen,
  onClose,
  onSelect,
  currentAudienceType = "following",
  currentAudienceIds = [],
}: ShareToSelectorProps) => {
  const [audienceType, setAudienceType] = useState<AudienceType>(currentAudienceType);
  const [selectedIds, setSelectedIds] = useState<string[]>(currentAudienceIds);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAudienceType(currentAudienceType);
      setSelectedIds(currentAudienceIds);
    }
  }, [isOpen, currentAudienceType, currentAudienceIds]);

  useEffect(() => {
    if (showSelectionModal) {
      loadItems();
    }
  }, [showSelectionModal, audienceType]);

  const loadItems = async () => {
    setLoading(true);
    try {
      if (audienceType === "community") {
        const data = await getUserCommunities();
        setCommunities(data);
      } else if (audienceType === "group") {
        const data = await getUserGroups();
        setGroups(data);
      }
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type: AudienceType) => {
    setAudienceType(type);
    if (type === "community" || type === "group") {
      setShowSelectionModal(true);
    } else {
      setSelectedIds([]);
      handleConfirm(type, []);
    }
  };

  const handleConfirm = (type: AudienceType, ids: string[]) => {
    onSelect(type, ids);
    setShowSelectionModal(false);
    onClose();
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const items = audienceType === "community" ? communities : groups;
    setSelectedIds(items.map((item) => item.id));
  };

  const items = audienceType === "community" ? communities : groups;

  return (
    <>
      <Dialog open={isOpen && !showSelectionModal} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Share To</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <button
              onClick={() => handleTypeSelect("space")}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all hover:scale-[1.02] flex items-center gap-4",
                audienceType === "space"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="p-3 rounded-full bg-primary/20">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Space</p>
                <p className="text-sm text-muted-foreground">
                  Share with entire university
                </p>
              </div>
              {audienceType === "space" && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </button>

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

      <Dialog open={showSelectionModal} onOpenChange={setShowSelectionModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                Select {audienceType === "community" ? "Communities" : "Groups"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="text-primary hover:text-primary"
              >
                All
              </Button>
            </DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {audienceType === "community" ? "communities" : "groups"} found
            </div>
          ) : (
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
                      <AvatarImage src={item.avatar || item.image_url} alt={item.name} />
                      <AvatarFallback>
                        {item.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(item.member_count || item.members_count || 0).toLocaleString()} members
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
          )}
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
