import { useState, useRef } from "react";
import { ImageIcon, Calendar, MapPin, Smile, X, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { uploadFile, FileMetadata } from "@/api/files.api";
import { toast } from "sonner";

interface PostComposerProps {
  onPost: (content: string, mediaUrls?: string[]) => void;
}

export function PostComposer({ onPost }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{ url: string; type: "image" | "video" }[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxChars = 280;

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const mediaFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    if (mediaFiles.length === 0) {
      toast.error("Please select only image or video files");
      return;
    }

    const hasImages = mediaFiles.some((file) => file.type.startsWith("image/"));
    const hasVideos = mediaFiles.some((file) => file.type.startsWith("video/"));

    if (hasImages && hasVideos) {
      toast.error("Cannot mix images and videos in one post");
      return;
    }

    if (hasVideos && mediaFiles.length > 1) {
      toast.error("Only one video allowed per post");
      return;
    }

    if (hasVideos && selectedMedia.length > 0) {
      toast.error("Cannot add video with existing media");
      return;
    }

    const maxSize = hasVideos ? 50 * 1024 * 1024 : 10 * 1024 * 1024; 
    const oversizedFiles = mediaFiles.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      const sizeLimit = hasVideos ? "50MB" : "10MB";
      toast.error(`Some files exceed ${sizeLimit} limit`);
      return;
    }

    const totalMedia = selectedMedia.length + mediaFiles.length;
    if (totalMedia > 4 && hasImages) {
      toast.error("Maximum 4 images allowed per post");
      return;
    }

    const newPreviews = mediaFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? ("image" as const) : ("video" as const),
    }));

    setSelectedMedia((prev) => [...prev, ...mediaFiles]);
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index].url);

    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && selectedMedia.length === 0) {
      toast.error("Please add some content or media");
      return;
    }

    try {
      setIsUploading(true);
      let mediaUrls: string[] = [];

      if (selectedMedia.length > 0) {
        const uploadPromises = selectedMedia.map((file) =>
          uploadFile({
            file,
            moduleType: "posts",
            accessLevel: "public",
          })
        );

        const uploadedMetadata = await Promise.all(uploadPromises);
        mediaUrls = uploadedMetadata.map((meta) => meta.url);
        setUploadedFiles(uploadedMetadata);
      }

      onPost(content, mediaUrls);

      setContent("");
      setSelectedMedia([]);
      setMediaPreviews([]);
      setUploadedFiles([]);

      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error posting:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const isDisabled =
    (!content.trim() && selectedMedia.length === 0) ||
    content.length > maxChars ||
    isUploading;

  return (
    <Card className="hidden md:block border-0 rounded-none border-b border-border p-4">
      <div className="flex space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src="/api/placeholder/48/48" />
          <AvatarFallback>YU</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="What's happening on campus?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[40px] border-none resize-none text-xl placeholder:text-muted-foreground focus-visible:ring-0 p-0"
          />

          {mediaPreviews.length > 0 && (
            <div className="mt-3">
              {mediaPreviews.length === 1 ? (
                <div className="relative rounded-2xl overflow-hidden border border-border">
                  {mediaPreviews[0].type === "image" ? (
                    <img
                      src={mediaPreviews[0].url}
                      alt="Preview"
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  ) : (
                    <video
                      src={mediaPreviews[0].url}
                      className="w-full h-auto max-h-96 object-cover"
                      controls
                    />
                  )}
                  <button
                    onClick={() => handleRemoveMedia(0)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : mediaPreviews.length === 2 ? (
                <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="relative border border-border rounded-xl overflow-hidden">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="relative border border-border rounded-xl overflow-hidden">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex space-x-4 text-primary">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-auto hover:bg-primary/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || mediaPreviews.length >= 4}
                title="Add image or video"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-auto hover:bg-primary/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || mediaPreviews.length >= 1}
                title="Add video"
              >
                <Video className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-auto hover:bg-primary/10"
                disabled
              >
                <Calendar className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-auto hover:bg-primary/10"
                disabled
              >
                <MapPin className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-auto hover:bg-primary/10"
                disabled
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              {isUploading && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </div>
              )}
              <span
                className={`text-sm ${
                  content.length > maxChars
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {content.length}/{maxChars}
              </span>
              <Button
                onClick={handlePost}
                disabled={isDisabled}
                className="rounded-full px-6 bg-primary hover:bg-primary-hover disabled:opacity-50"
              >
                {isUploading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
