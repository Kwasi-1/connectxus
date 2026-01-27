import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Image as ImageIcon, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin.api";
import { createPost } from "@/api/posts.api";
import { uploadFile } from "@/api/files.api";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface CreateHighlightModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
}

export function CreateHighlightModal({
  isOpen,
  onOpenChange,
  spaceId,
}: CreateHighlightModalProps) {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { admin } = useAdminAuth();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setSelectedImage(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedImage) {
      toast.error("Please enter content or select an image");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];

      if (selectedImage) {
        const uploadedFile = await uploadFile({
          file: selectedImage,
          moduleType: "posts",
          accessLevel: "public",
        });
        imageUrls.push(uploadedFile.url);
      }

      const post = await createPost({
        content: content,
        media: imageUrls,
        visibility: "public",
        space_id: spaceId,
      });

      await adminApi.addCampusHighlight(spaceId, post.id);

      toast.success("Highlight created successfully");
      queryClient.invalidateQueries({
        queryKey: ["admin-highlights", spaceId],
      });
      setContent("");
      removeImage();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to create highlight:", error);
      toast.error(error.response?.data?.error || "Failed to create highlight");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Campus Highlight</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              placeholder="What's happening on campus?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none min-h-[120px]"
            />
          </div>

          {imagePreview && (
            <div className="relative rounded-md overflow-hidden border">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-muted-foreground"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create & Highlight"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
