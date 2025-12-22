import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadFile } from "@/api/files.api";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  label: string;
  currentImage?: string;
  onUploadComplete: (url: string) => void;
  moduleType: string;
  moduleId?: string;
  maxSizeMB?: number;
  aspectRatio?: string;
  showPreview?: boolean;
}

export function ImageUploadField({
  label,
  currentImage,
  onUploadComplete,
  moduleType,
  moduleId,
  maxSizeMB = 5,
  aspectRatio = "16/9",
  showPreview = true,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Image must be less than ${maxSizeMB}MB`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      setIsUploading(true);
      const uploaded = await uploadFile({
        file,
        moduleType,
        moduleId,
        accessLevel: "public",
      });
      onUploadComplete(uploaded.url);
      toast.success(`${label} uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${label.toLowerCase()}`);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onUploadComplete("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const displayImage = preview || currentImage;

  return (
    <div>
      <Label>{label}</Label>
      {showPreview && displayImage ? (
        <div className="mt-2 relative group">
          <img
            src={displayImage}
            alt={label}
            className="w-full h-48 object-cover rounded-lg border border-border"
            style={{ aspectRatio }}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleSelect}
              className="hidden"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Change
                </>
              )}
            </Button>
            {displayImage && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-48 border-dashed"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="h-6 w-6 mr-2" />
                Upload {label}
              </>
            )}
          </Button>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-1">
        Recommended: JPG, PNG or WebP. Max {maxSizeMB}MB.
      </p>
    </div>
  );
}
