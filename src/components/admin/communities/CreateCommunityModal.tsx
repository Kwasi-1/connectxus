import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Community } from "@/types/communities";

interface CreateCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCommunity: (community: Partial<Community>) => void;
}

export function CreateCommunityModal({
  open,
  onOpenChange,
  onCreateCommunity,
}: CreateCommunityModalProps) {
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    category: "" as Community["category"],
    coverImage: null as File | null,
  });

  const handleCreate = () => {
        const coverImageUrl = newCommunity.coverImage
      ? URL.createObjectURL(newCommunity.coverImage)
      : undefined;

    const payload: Partial<Community> = {
      name: newCommunity.name,
      description: newCommunity.description,
      category: newCommunity.category,
      coverImage: coverImageUrl,
    };

    onCreateCommunity(payload);
    onOpenChange(false);
        setNewCommunity({
      name: "",
      description: "",
      category: "" as Community["category"],
      coverImage: null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Community</DialogTitle>
          <DialogDescription>
            Create a new community for campus activities and departments.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Community Name</Label>
            <Input
              id="name"
              value={newCommunity.name}
              onChange={(e) =>
                setNewCommunity((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Enter community name"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newCommunity.description}
              onChange={(e) =>
                setNewCommunity((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the community's purpose"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={newCommunity.category}
              onValueChange={(value) =>
                setNewCommunity((prev) => ({
                  ...prev,
                  category: value as Community["category"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Department">Department</SelectItem>
                <SelectItem value="Level">Level</SelectItem>
                <SelectItem value="Hostel">Hostel</SelectItem>
                <SelectItem value="Faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="coverImage">Cover Image</Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewCommunity((prev) => ({
                  ...prev,
                  coverImage: e.target.files?.[0] || null,
                }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Community</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
