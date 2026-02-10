import { useState, useRef, useEffect } from "react";
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
import { useStories } from "@/hooks/useStories";
import { uploadFile } from "@/api/files.api";

interface NewStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewStoryModal = ({ isOpen, onClose }: NewStoryModalProps) => {
  const { user } = useAuth();
  const { createStory, isCreating } = useStories();
  const [storyType, setStoryType] = useState<StoryType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(IMAGE_FILTERS[0]);
  const [activePanel, setActivePanel] = useState<"caption" | "filters" | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showShareToSelector, setShowShareToSelector] = useState(false);
  const [audienceType, setAudienceType] = useState<AudienceType>("following");
  const [audienceIds, setAudienceIds] = useState<string[]>([]);
  const [isTrimming, setIsTrimming] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const trimVideoToThreeMinutes = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;

      video.onloadedmetadata = async () => {
        const duration = video.duration;

        if (duration <= 180) {
          resolve(file);
          return;
        }

        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          video.currentTime = 0;
          await new Promise((res) => {
            video.onseeked = res;
          });

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const stream = canvas.captureStream(30);

          const audioContext = new AudioContext();
          const source = audioContext.createMediaElementSource(video);
          const destination = audioContext.createMediaStreamDestination();
          source.connect(destination);
          source.connect(audioContext.destination);

          stream.addTrack(destination.stream.getAudioTracks()[0]);

          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm;codecs=vp9,opus",
            videoBitsPerSecond: 2500000,
          });

          const chunks: Blob[] = [];
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            const trimmedFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, ".webm"),
              {
                type: "video/webm",
              },
            );
            resolve(trimmedFile);
            video.pause();
            audioContext.close();
          };

          let startTime = Date.now();
          const drawFrame = () => {
            if (video.currentTime < 180 && Date.now() - startTime < 180000) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              requestAnimationFrame(drawFrame);
            } else {
              mediaRecorder.stop();
            }
          };

          mediaRecorder.start();
          video.play();
          drawFrame();
        } catch (error) {
          console.error("Error trimming video:", error);
          reject(error);
        }
      };

      video.onerror = () => {
        reject(new Error("Failed to load video"));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Please select an image or video file");
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File must be less than 50MB");
      return;
    }

    const type = file.type.startsWith("image/") ? "image" : "video";

    if (type === "video") {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = async () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;

        if (duration > 180) {
          setIsTrimming(true);
          toast.info(
            "Video is longer than 3 minutes. Automatically trimming to first 3 minutes...",
          );

          try {
            const trimmedFile = await trimVideoToThreeMinutes(file);
            setMediaType(type);
            setStoryType(type);
            setSelectedFile(trimmedFile);
            const url = URL.createObjectURL(trimmedFile);
            setPreviewUrl(url);
            setIsTrimming(false);
            toast.success("Video trimmed successfully");
          } catch (error) {
            console.error("Error trimming video:", error);
            toast.error("Failed to trim video. Please try a shorter video.");
            setIsTrimming(false);
          }
          return;
        }

        setMediaType(type);
        setStoryType(type);
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      };
      video.src = URL.createObjectURL(file);
    } else {
      setMediaType(type);
      setStoryType(type);
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleTextStoryComplete = async (text: string, background: string) => {
    if (audienceType === "community" && audienceIds.length === 0) {
      toast.error("Please select at least one community");
      return;
    }
    if (audienceType === "group" && audienceIds.length === 0) {
      toast.error("Please select at least one group");
      return;
    }

    try {
      const isGradient = background.includes("gradient");

      createStory({
        story_type: "text",
        content: text,
        background_color: isGradient ? undefined : background,
        background_gradient: isGradient ? background : undefined,
        audience_type: audienceType,
        community_ids: audienceType === "community" ? audienceIds : undefined,
        group_ids: audienceType === "group" ? audienceIds : undefined,
      });

      handleReset();
    } catch (error) {
      console.error("Error posting text story:", error);
      toast.error("Failed to post story");
    }
  };

  const handlePost = async () => {
    if (!selectedFile || !previewUrl || !mediaType) return;

    if (audienceType === "community" && audienceIds.length === 0) {
      toast.error("Please select at least one community");
      return;
    }
    if (audienceType === "group" && audienceIds.length === 0) {
      toast.error("Please select at least one group");
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await uploadFile({
        file: selectedFile,
        moduleType: "story",
        accessLevel: "public",
      });

      createStory({
        story_type: mediaType,
        media_url: uploadResult.url,
        caption: caption || undefined,
        filter_name:
          selectedFilter.name !== "None" ? selectedFilter.name : undefined,
        filter_css:
          selectedFilter.name !== "None" ? selectedFilter.css : undefined,
        audience_type: audienceType,
        community_ids: audienceType === "community" ? audienceIds : undefined,
        group_ids: audienceType === "group" ? audienceIds : undefined,
      });

      handleReset();
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

  const getShareButtonText = () => {
    if (audienceType === "space") return "Space";
    if (audienceType === "following") return "Following";
    if (audienceType === "community" && audienceIds.length > 0) {
      return `Communities (${audienceIds.length})`;
    }
    if (audienceType === "group" && audienceIds.length > 0) {
      return `Groups (${audienceIds.length})`;
    }
    if (audienceType === "community") return "Communities";
    if (audienceType === "group") return "Groups";
    return "Following";
  };

  if (!isOpen) return null;

  if (isTrimming) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <p className="text-white text-lg">Trimming video to 3 minutes...</p>
        </div>
      </div>
    );
  }

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
          audienceType={audienceType}
          audienceIds={audienceIds}
          onAudienceSelect={handleAudienceSelect}
        />

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

  if (previewUrl && mediaType) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="relative w-full h-full max-w-md mx-auto flex flex-col bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between p-4">
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
                disabled={isUploading}
              >
                {getShareButtonText()}
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
            {mediaType === "image" ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                style={{
                  filter: selectedFilter.css,
                }}
              />
            ) : (
              <video
                src={previewUrl}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                style={{
                  filter: selectedFilter.css,
                }}
                controls
                autoPlay
                loop
              />
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent space-y-3">
            <div className="flex gap-2">
              <Button
                variant={activePanel === "caption" ? "secondary" : "ghost"}
                size="icon"
                onClick={() =>
                  setActivePanel(activePanel === "caption" ? null : "caption")
                }
                className="bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
              {mediaType === "image" && (
                <Button
                  variant={activePanel === "filters" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() =>
                    setActivePanel(activePanel === "filters" ? null : "filters")
                  }
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20"
                >
                  <Wand2 className="w-5 h-5" />
                </Button>
              )}
            </div>

            {activePanel === "caption" && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2">
                <Input
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={150}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                />
                <p className="text-xs text-white/50 text-right">
                  {caption.length}/150
                </p>
              </div>
            )}

            {activePanel === "filters" && mediaType === "image" && (
              <div className="animate-in slide-in-from-bottom-2">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {IMAGE_FILTERS.map((filter) => (
                    <button
                      key={filter.name}
                      onClick={() => setSelectedFilter(filter)}
                      className={cn(
                        "flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                        selectedFilter.name === filter.name
                          ? "bg-white/20 border-2 border-white"
                          : "bg-white/5 border-2 border-transparent hover:bg-white/10",
                      )}
                    >
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden"
                        style={{
                          backgroundImage: `url(${previewUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          filter: filter.css,
                        }}
                      />
                      <span className="text-xs text-white font-medium">
                        {filter.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handlePost}
              disabled={isUploading || isCreating}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-full shadow-lg"
            >
              {isUploading || isCreating ? (
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

        <ShareToSelector
          isOpen={showShareToSelector}
          onClose={() => setShowShareToSelector(false)}
          onSelect={handleAudienceSelect}
          currentAudienceType={audienceType}
          currentAudienceIds={audienceIds}
        />

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

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="h-full md:h-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <div className="py-4 -mt-32 md:mt-0">
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="gap-y-3 flex flex-row md:flex-col gap-x-2">
            <button
              onClick={() => setStoryType("text")}
              className="w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-all group"
            >
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="p-3 bg-muted/20 rounded-full group-hover:bg-muted/30 transition-colors">
                  <Type className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="md:font-semibold text-lg">
                    Text <span className="hidden md:inline-block">Story</span>
                  </p>
                  <p className="hidden md:block text-sm text-muted-foreground">
                    Share your thoughts with custom backgrounds
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-5 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-all group"
            >
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="p-3 bg-muted/20 rounded-full group-hover:bg-muted/30 transition-colors">
                  <ImageIcon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="md:font-semibold text-lg">
                    Image <span className="hidden md:inline-block">Story</span>
                  </p>
                  <p className="hidden md:block text-sm text-muted-foreground">
                    Upload a photo with caption & filters
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-5 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-all group"
            >
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="p-3 bg-muted/20 rounded-full group-hover:bg-muted/30 transition-colors">
                  <Video className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="md:font-semibold text-lg">
                    Video <span className="hidden md:inline-block">Story</span>
                  </p>
                  <p className="hidden md:block text-sm text-muted-foreground">
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
