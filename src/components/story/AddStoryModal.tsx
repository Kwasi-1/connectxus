import { useState, useRef } from "react";
import { X, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (mediaUrl: string, mediaType: "image" | "video") => void;
}

export const AddStoryModal = ({
  isOpen,
  onClose,
  onStoryCreated,
}: AddStoryModalProps) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Please select an image or video file");
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File must be less than 50MB");
      return;
    }

    const type = file.type.startsWith("image/") ? "image" : "video";
    setMediaType(type);
    setSelectedFile(file);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handlePost = async () => {
    if (!selectedFile || !previewUrl || !mediaType) return;

    setIsUploading(true);
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you would upload to a server here
      // For now, we'll just use the local blob URL
      onStoryCreated(previewUrl, mediaType);

      toast.success("Story posted successfully!");
      handleClose();
    } catch (error) {
      console.error("Error posting story:", error);
      toast.error("Failed to post story");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-background rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Add to Story</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!previewUrl ? (
            <div className="space-y-4">
              {/* User info */}
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Add to your story
                  </p>
                </div>
              </div>

              {/* Upload options */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload story media"
              />

              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 border-2 border-dashed border-muted-foreground/30 rounded-xl hover:border-primary hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                      <ImageIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Upload Photo</p>
                      <p className="text-sm text-muted-foreground">
                        Choose a photo from your device
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 border-2 border-dashed border-muted-foreground/30 rounded-xl hover:border-primary hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                      <Video className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Upload Video</p>
                      <p className="text-sm text-muted-foreground">
                        Choose a video from your device
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Your story will be visible for 24 hours
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-[9/16] max-h-[60vh] bg-black rounded-xl overflow-hidden">
                {mediaType === "image" ? (
                  <img
                    src={previewUrl}
                    alt="Story preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    className="w-full h-full object-contain"
                    controls
                  />
                )}

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setMediaType(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                  disabled={isUploading}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Post button */}
              <Button
                onClick={handlePost}
                disabled={isUploading}
                className="w-full py-6 text-lg font-semibold"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Share to Story"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
