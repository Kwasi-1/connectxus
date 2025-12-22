import { useState, useRef } from "react";
import { ImageIcon, Calendar, MapPin, Smile, X, Loader2 } from "lucide-react";
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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxChars = 280;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      toast.error("Please select only image files");
      return;
    }

    const maxSize = 10 * 1024 * 1024; 
    const oversizedFiles = imageFiles.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error("Some images exceed 10MB limit");
      return;
    }

    const totalImages = selectedImages.length + imageFiles.length;
    if (totalImages > 4) {
      toast.error("Maximum 4 images allowed per post");
      return;
    }

    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));

    setSelectedImages((prev) => [...prev, ...imageFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      toast.error("Please add some content or images");
      return;
    }

    try {
      setIsUploading(true);
      let mediaUrls: string[] = [];

      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map((file) =>
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
      setSelectedImages([]);
      setImagePreviews([]);
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
    (!content.trim() && selectedImages.length === 0) ||
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

          {/* Image Preview */}
          {imagePreviews.length > 0 && (
            <div className="mt-3">
              {imagePreviews.length === 1 ? (
                <div className="relative rounded-2xl overflow-hidden border border-border">
                  <img
                    src={imagePreviews[0]}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(0)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : imagePreviews.length === 2 ? (
                <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative border border-border rounded-xl overflow-hidden">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative border border-border rounded-xl overflow-hidden">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
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
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-auto hover:bg-primary/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || imagePreviews.length >= 4}
              >
                <ImageIcon className="h-5 w-5" />
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
