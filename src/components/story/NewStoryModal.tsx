import { useState, useRef } from "react";
import {
  X,
  Image as ImageIcon,
  Video,
  Loader2,
  Type,
  Wand2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TextStoryCreator } from "./TextStoryCreator";
import { ShareToSelector } from "./ShareToSelector";
import { IMAGE_FILTERS, StoryType, AudienceType } from "@/types/storyTypes";
import {
  saveStoryToStorage,
  getSavedAudienceSelection,
} from "@/utils/newStoryStorage";

interface NewStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

export const NewStoryModal = ({
  isOpen,
  onClose,
  onStoryCreated,
}: NewStoryModalProps) => {
  const { user } = useAuth();
  const [storyType, setStoryType] = useState<StoryType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(IMAGE_FILTERS[0]);
  const [activePanel, setActivePanel] = useState<"caption" | "filters" | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showShareToSelector, setShowShareToSelector] = useState(false);
  const [audienceType, setAudienceType] = useState<AudienceType>("following");
  const [audienceIds, setAudienceIds] = useState<string[]>([]);

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
    setStoryType(type);
    setSelectedFile(file);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleTextStoryComplete = (text: string, background: string) => {
    // Save text story
    const savedAudience = getSavedAudienceSelection();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const storyData = {
      id: `story_${Date.now()}`,
      type: "text" as StoryType,
      caption: text,
      backgroundColor: background,
      audienceType: savedAudience.type,
      audienceSelection: savedAudience.ids,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      userId: user?.id || "user1",
      username: user?.name || "user",
      userAvatar: user?.avatar,
    };

    saveStoryToStorage(storyData);
    toast.success("Text story posted!");
    handleReset();
    onStoryCreated();
  };

  const handlePost = async () => {
    if (!selectedFile || !previewUrl || !mediaType) return;

    setIsUploading(true);
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const savedAudience = getSavedAudienceSelection();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const storyData = {
        id: `story_${Date.now()}`,
        type: mediaType as StoryType,
        mediaUrl: previewUrl,
        caption: caption || undefined,
        filter: selectedFilter.name !== "None" ? selectedFilter : undefined,
        audienceType: savedAudience.type,
        audienceSelection: savedAudience.ids,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        userId: user?.id || "user1",
        username: user?.name || "user",
        userAvatar: user?.avatar,
      };

      saveStoryToStorage(storyData);
      toast.success("Story posted successfully!");
      handleReset();
      onStoryCreated();
    } catch (error) {
      console.error("Error posting story:", error);
      toast.error("Failed to post story");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setStoryType(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    setCaption("");
    setSelectedFilter(IMAGE_FILTERS[0]);
    setActivePanel(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleCloseClick = () => {
    if (storyType || selectedFile || caption) {
      setShowDiscardDialog(true);
    } else {
      handleReset();
    }
  };

  const handleAudienceSelect = (type: AudienceType, ids: string[]) => {
    setAudienceType(type);
    setAudienceIds(ids);
  };

  if (!isOpen) return null;

  // Text Story Creator
  if (storyType === "text") {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <TextStoryCreator
          onComplete={handleTextStoryComplete}
          onClose={() => {
            if (caption) {
              setShowDiscardDialog(true);
            } else {
              setStoryType(null);
            }
          }}
        />

        {/* Discard Dialog */}
        <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Discard Story?</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Your changes will be lost if you discard this story.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDiscardDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDiscardDialog(false);
                  handleReset();
                }}
              >
                Discard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Image/Video Editor
  if (previewUrl && mediaType) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="relative w-full h-full max-w-md mx-auto flex flex-col bg-gradient-to-br from-black via-gray-900 to-black">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseClick}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20"
              disabled={isUploading}
            >
              <X className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareToSelector(true)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 px-4"
            >
              Share To
            </Button>
          </div>

          {/* Main Story Preview */}
          <div className="relative flex-1 flex items-center justify-center p-4 mt-16">
            <div className="relative w-full h-full max-h-[75vh] bg-black rounded-2xl overflow-hidden shadow-2xl">
              {mediaType === "image" ? (
                <img
                  src={previewUrl}
                  alt="Story preview"
                  className={cn(
                    "w-full h-full object-contain",
                    selectedFilter.cssClass
                  )}
                />
              ) : (
                <video
                  src={previewUrl}
                  className={cn(
                    "w-full h-full object-contain",
                    selectedFilter.cssClass
                  )}
                  controls
                  muted
                  loop
                />
              )}

              {/* Caption Overlay */}
              {caption && (
                <div className="absolute bottom-20 left-0 right-0 px-6">
                  <p className="text-white text-xl font-semibold text-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">
                    {caption}
                  </p>
                </div>
              )}
            </div>

            {/* Right Side Toolbar */}
            <div className="absolute -right-14 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setActivePanel(activePanel === "caption" ? null : "caption")
                }
                className={cn(
                  "w-16 h-16 rounded-full text-black flex flex-col gap-0.5 py-2 backdrop-blur-md border transition-all",
                  activePanel === "caption"
                    ? "bg-white hover:bg-white/90 border-white shadow-lg scale-110"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                )}
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-[9px] font-medium">Caption</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setActivePanel(activePanel === "filters" ? null : "filters")
                }
                className={cn(
                  "w-16 h-16 rounded-full text-black flex flex-col gap-0.5 py-2 backdrop-blur-md border transition-all",
                  activePanel === "filters"
                    ? "bg-white hover:bg-white/90 border-white shadow-lg scale-110"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                )}
              >
                <Wand2 className="w-6 h-6" />
                <span className="text-[9px] font-medium">Filters</span>
              </Button>
            </div>
          </div>

          {/* Active Panel */}
          {activePanel && (
            <div className="absolute bottom-32 left-0 right-0 mx-4 bg-background/98 backdrop-blur-xl rounded-2xl p-5 z-30 border border-primary/30 shadow-2xl">
              {activePanel === "caption" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-base">Add Caption</h3>
                  <Input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="w-full"
                    maxLength={150}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {caption.length}/150
                  </p>
                </div>
              )}

              {activePanel === "filters" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-base">Apply Filter</h3>
                  <div className="grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto pr-2">
                    {IMAGE_FILTERS.map((filter) => (
                      <button
                        key={filter.name}
                        onClick={() => setSelectedFilter(filter)}
                        className={cn(
                          "p-3 rounded-lg text-sm capitalize transition-all font-medium text-center",
                          selectedFilter.name === filter.name
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-accent hover:bg-accent/80"
                        )}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="absolute bottom-4 left-0 right-0 px-4 z-20">
            <Button
              onClick={handlePost}
              disabled={isUploading}
              className="w-full bg-white hover:bg-white/90 text-black rounded-full py-6 font-bold shadow-lg transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Story"
              )}
            </Button>
          </div>
        </div>

        {/* Share To Selector */}
        <ShareToSelector
          isOpen={showShareToSelector}
          onClose={() => setShowShareToSelector(false)}
          onSelect={handleAudienceSelect}
        />

        {/* Discard Dialog */}
        <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Discard Story?</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Your changes will be lost if you discard this story.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDiscardDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDiscardDialog(false);
                  handleReset();
                }}
              >
                Discard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Initial Selection Screen
  return (
    <Dialog open={isOpen} onOpenChange={handleCloseClick}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <div className="py-4">
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
                Story visible for 24 hours
              </p>
            </div>
          </div>

          {/* Story Type Options */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-3">
            <button
              onClick={() => setStoryType("text")}
              className="w-full p-5 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Type className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-lg">Text Story</p>
                  <p className="text-sm text-muted-foreground">
                    Share your thoughts with custom backgrounds
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-5 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                  <ImageIcon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-lg">Image Story</p>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo with caption & filters
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-5 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Video className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-lg">Video Story</p>
                  <p className="text-sm text-muted-foreground">
                    Upload a video with caption & filters
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
