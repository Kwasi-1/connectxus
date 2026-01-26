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
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/api/files.api";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2 } from "lucide-react";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    category: "" as Community["category"],
    level: 0,
    avatar: null as File | null,
    coverImage: null as File | null,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCreate = async () => {
    if (!newCommunity.name || !newCommunity.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      let avatarUrl: string | undefined = undefined;
      let coverImageUrl: string | undefined = undefined;

      if (newCommunity.avatar) {
        const uploaded = await uploadFile({
          file: newCommunity.avatar,
          moduleType: "communities",
          accessLevel: "public",
        });
        avatarUrl = uploaded.url;
      }

      if (newCommunity.coverImage) {
        const uploaded = await uploadFile({
          file: newCommunity.coverImage,
          moduleType: "communities",
          accessLevel: "public",
        });
        coverImageUrl = uploaded.url;
      }

      const payload: Partial<Community> = {
        name: newCommunity.name,
        description: newCommunity.description,
        category: newCommunity.category,
        level: newCommunity.level,
        avatar: avatarUrl,
        coverImage: coverImageUrl,
      };

      await onCreateCommunity(payload);

      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }

      setNewCommunity({
        name: "",
        description: "",
        category: "" as Community["category"],
        level: 0,
        avatar: null,
        coverImage: null,
      });
      setAvatarPreview(null);
      setCoverImagePreview(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating community:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setNewCommunity((prev) => ({
      ...prev,
      avatar: file,
    }));
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setNewCommunity((prev) => ({
      ...prev,
      avatar: null,
    }));
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Cover image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCoverImagePreview(previewUrl);
    setNewCommunity((prev) => ({
      ...prev,
      coverImage: file,
    }));
  };

  const handleRemoveCoverImage = () => {
    if (coverImagePreview) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImagePreview(null);
    setNewCommunity((prev) => ({
      ...prev,
      coverImage: null,
    }));
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
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="level">Level</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="level">Level *</Label>
            <Select
              value={newCommunity.level.toString()}
              onValueChange={(value) =>
                setNewCommunity((prev) => ({
                  ...prev,
                  level: parseInt(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Levels</SelectItem>
                {[100, 200, 300, 400].map((lvl) => {
                  const userLevelNum = user?.level ? parseInt(user.level) : 0;
                  if (userLevelNum === 0 || lvl <= userLevelNum) {
                    return (
                      <SelectItem key={lvl} value={lvl.toString()}>
                        Level {lvl}
                      </SelectItem>
                    );
                  }
                  return null;
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select the minimum level required to join this community
            </p>
          </div>
          <div>
            <Label htmlFor="avatar">Avatar (Optional)</Label>
            <div className="space-y-2">
              {avatarPreview && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                  id="avatar-upload"
                  aria-label="Upload avatar"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {newCommunity.avatar ? "Change Avatar" : "Upload Avatar"}
                  </Button>
                  {newCommunity.avatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5MB. JPG, PNG, or GIF. Recommended: 400x400px (square)
                </p>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="coverImage">Cover Image (Optional)</Label>
            <div className="space-y-2">
              {coverImagePreview && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageSelect}
                  className="hidden"
                  id="cover-image-upload"
                  aria-label="Upload cover image"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("cover-image-upload")?.click()
                    }
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {newCommunity.coverImage ? "Change Cover" : "Upload Cover"}
                  </Button>
                  {newCommunity.coverImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoverImage}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 10MB. JPG, PNG, or GIF. Recommended: 1200x400px
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Community"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
