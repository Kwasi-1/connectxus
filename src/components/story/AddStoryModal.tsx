import { useState, useRef } from "react";
import {
  X,
  Image as ImageIcon,
  Video,
  Loader2,
  Type,
  Smile,
  Pencil,
  Music,
  Wand2,
  Settings,
  Save,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface AddStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (mediaUrl: string, mediaType: "image" | "video") => void;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

interface StickerOverlay {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

const STICKER_EMOJIS = [
  "❤️",
  "😂",
  "😍",
  "🔥",
  "👍",
  "🎉",
  "😊",
  "💯",
  "✨",
  "🌟",
  "💪",
  "🎵",
  "📚",
  "☕",
  "🎓",
  "💡",
];
const TEXT_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
];
const MUSIC_OPTIONS = [
  "Trending Song 1",
  "Popular Beat 2",
  "Campus Vibes 3",
  "Study Playlist 4",
  "None",
];

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

  // Story editing states
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [stickerOverlays, setStickerOverlays] = useState<StickerOverlay[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string>("None");
  const [selectedEffect, setSelectedEffect] = useState<string>("none");
  const [activePanel, setActivePanel] = useState<
    "text" | "stickers" | "music" | "effects" | null
  >(null);
  const [newText, setNewText] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [shareWithCloseFriends, setShareWithCloseFriends] = useState(false);

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
    setTextOverlays([]);
    setStickerOverlays([]);
    setSelectedMusic("None");
    setSelectedEffect("none");
    setActivePanel(null);
    setNewText("");
    setShareWithCloseFriends(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const addTextOverlay = () => {
    if (!newText.trim()) return;
    const textOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: newText,
      x: 50,
      y: 50,
      color: textColor,
      fontSize: 24,
    };
    setTextOverlays([...textOverlays, textOverlay]);
    setNewText("");
    setActivePanel(null);
    toast.success("Text added!");
  };

  const addSticker = (emoji: string) => {
    const sticker: StickerOverlay = {
      id: Date.now().toString(),
      emoji,
      x: 50,
      y: 30,
      size: 48,
    };
    setStickerOverlays([...stickerOverlays, sticker]);
    toast.success("Sticker added!");
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter((t) => t.id !== id));
  };

  const removeStickerOverlay = (id: string) => {
    setStickerOverlays(stickerOverlays.filter((s) => s.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {!previewUrl ? (
        /* Initial Upload Screen */
        <div className="relative w-full max-w-lg bg-background rounded-2xl shadow-xl m-4">
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
          </div>
        </div>
      ) : (
        /* Story Editor Screen */
        <div className="relative w-full h-full max-w-md mx-auto flex flex-col">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full"
              disabled={isUploading}
            >
              <X className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white rounded-full"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* Main Story Preview Area */}
          <div className="relative flex-1 flex items-center justify-center">
            {/* Background media */}
            <div className="relative w-full h-full max-h-[85vh] bg-black/20 backdrop-blur-sm rounded-3xl overflow-hidden border-2 border-dashed border-white/30 mx-4">
              {mediaType === "image" ? (
                <img
                  src={previewUrl}
                  alt="Story preview"
                  className={cn(
                    "w-full h-full object-cover",
                    selectedEffect === "grayscale" && "grayscale",
                    selectedEffect === "sepia" && "sepia",
                    selectedEffect === "blur" && "blur-sm",
                    selectedEffect === "brightness" && "brightness-125",
                    selectedEffect === "contrast" && "contrast-125"
                  )}
                />
              ) : (
                <video
                  src={previewUrl}
                  className={cn(
                    "w-full h-full object-cover",
                    selectedEffect === "grayscale" && "grayscale",
                    selectedEffect === "sepia" && "sepia",
                    selectedEffect === "blur" && "blur-sm"
                  )}
                  controls
                  muted
                  loop
                />
              )}

              {/* Text Overlays */}
              {textOverlays.map((textOverlay) => (
                <div
                  key={textOverlay.id}
                  className="absolute cursor-move"
                  style={{
                    left: `${textOverlay.x}%`,
                    top: `${textOverlay.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={() => removeTextOverlay(textOverlay.id)}
                >
                  <p
                    className="font-bold drop-shadow-lg px-3 py-1 rounded"
                    style={{
                      color: textOverlay.color,
                      fontSize: `${textOverlay.fontSize}px`,
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {textOverlay.text}
                  </p>
                </div>
              ))}

              {/* Sticker Overlays */}
              {stickerOverlays.map((sticker) => (
                <div
                  key={sticker.id}
                  className="absolute cursor-move"
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={() => removeStickerOverlay(sticker.id)}
                >
                  <span
                    style={{ fontSize: `${sticker.size}px` }}
                    className="drop-shadow-lg"
                  >
                    {sticker.emoji}
                  </span>
                </div>
              ))}

              {/* Center Text for empty state */}
              {textOverlays.length === 0 && stickerOverlays.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-center text-white/80">
                    <p className="font-semibold text-lg mb-2">
                      Create New Story
                    </p>
                    <p className="text-sm">Share your campus moments</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Toolbar */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setActivePanel(activePanel === "text" ? null : "text")
                }
                className={cn(
                  "w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 text-white flex flex-col gap-1 py-2",
                  activePanel === "text" && "bg-primary hover:bg-primary/90"
                )}
              >
                <Type className="w-6 h-6" />
                <span className="text-[10px]">Text</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setActivePanel(activePanel === "stickers" ? null : "stickers")
                }
                className={cn(
                  "w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 text-white flex flex-col gap-1 py-2",
                  activePanel === "stickers" && "bg-primary hover:bg-primary/90"
                )}
              >
                <Smile className="w-6 h-6" />
                <span className="text-[10px]">Stickers</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 text-white flex flex-col gap-1 py-2"
              >
                <Pencil className="w-6 h-6" />
                <span className="text-[10px]">Draw</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setActivePanel(activePanel === "music" ? null : "music")
                }
                className={cn(
                  "w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 text-white flex flex-col gap-1 py-2",
                  activePanel === "music" && "bg-primary hover:bg-primary/90"
                )}
              >
                <Music className="w-6 h-6" />
                <span className="text-[10px]">Music</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setActivePanel(activePanel === "effects" ? null : "effects")
                }
                className={cn(
                  "w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 text-white flex flex-col gap-1 py-2",
                  activePanel === "effects" && "bg-primary hover:bg-primary/90"
                )}
              >
                <Wand2 className="w-6 h-6" />
                <span className="text-[10px]">Effects</span>
              </Button>
            </div>
          </div>

          {/* Active Panel Overlay */}
          {activePanel && (
            <div className="absolute bottom-32 left-0 right-0 mx-4 bg-background/95 backdrop-blur-sm rounded-2xl p-4 z-30 border border-border shadow-2xl">
              {activePanel === "text" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Add Text</h3>
                  <Input
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Type your text..."
                    className="w-full"
                    onKeyPress={(e) => e.key === "Enter" && addTextOverlay()}
                  />
                  <div className="flex gap-2 flex-wrap">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2",
                          textColor === color
                            ? "border-primary scale-110"
                            : "border-border"
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                        title={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <Button onClick={addTextOverlay} className="w-full" size="sm">
                    Add Text
                  </Button>
                </div>
              )}

              {activePanel === "stickers" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Add Stickers</h3>
                  <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                    {STICKER_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addSticker(emoji)}
                        className="text-3xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === "music" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Add Music</h3>
                  <div className="space-y-2">
                    {MUSIC_OPTIONS.map((music) => (
                      <button
                        key={music}
                        onClick={() => {
                          setSelectedMusic(music);
                          toast.success(
                            music === "None"
                              ? "Music removed"
                              : `"${music}" added`
                          );
                        }}
                        className={cn(
                          "w-full p-3 rounded-lg text-left transition-colors",
                          selectedMusic === music
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent hover:bg-accent/70"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          <span className="text-sm">{music}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === "effects" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Apply Effects</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      "none",
                      "grayscale",
                      "sepia",
                      "blur",
                      "brightness",
                      "contrast",
                    ].map((effect) => (
                      <button
                        key={effect}
                        onClick={() => setSelectedEffect(effect)}
                        className={cn(
                          "p-3 rounded-lg text-sm capitalize transition-colors",
                          selectedEffect === effect
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent hover:bg-accent/70"
                        )}
                      >
                        {effect}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="absolute bottom-4 left-0 right-0 px-4 z-20 space-y-3">
            {/* Save Button */}
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/50 hover:bg-black/70 text-white rounded-full px-4 absolute bottom-20 left-4"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>

            {/* Select Media Button */}
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-xs mx-auto bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-semibold flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-5 h-5" />
              Select Media
            </Button>
            <p className="text-center text-xs text-white/70">
              Supports JPG, PNG, MP4
            </p>

            {/* Share Options */}
            <div className="flex gap-3 justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => setShareWithCloseFriends(!shareWithCloseFriends)}
                className={cn(
                  "flex-1 max-w-[180px] rounded-full py-6 font-semibold border-2",
                  shareWithCloseFriends
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-background/80 border-white/30 text-white"
                )}
              >
                <Users className="w-5 h-5 mr-2" />
                Close Friends
              </Button>

              <Button
                onClick={handlePost}
                disabled={isUploading}
                className="flex-1 max-w-[180px] bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-semibold"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    Your Story
                    <span className="ml-2">→</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
