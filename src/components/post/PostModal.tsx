import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ImageIcon,
  Calendar,
  MapPin,
  Smile,
  X,
  Globe,
  Users,
  Lock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (content: string, audience: string) => void;
}

export function PostModal({ isOpen, onClose, onPost }: PostModalProps) {
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("everyone");
  const maxChars = 280;

  const handlePost = () => {
    if (content.trim()) {
      onPost(content, audience);
      setContent("");
      setAudience("everyone");
      onClose();
    }
  };

  const isDisabled = !content.trim() || content.length > maxChars;

  const audienceOptions = [
    { value: "everyone", label: "Everyone", icon: Globe },
    { value: "following", label: "Following", icon: Users },
    { value: "private", label: "Private", icon: Lock },
  ];

  const selectedAudienceOption = audienceOptions.find(
    (opt) => opt.value === audience
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="flex flex-row items-center justify-between p-4 pb-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-lg font-semibold tracking-wider">
              Compose Post
            </DialogTitle>
          </div>
          <Button
            onClick={handlePost}
            disabled={isDisabled}
            className="rounded-full px-6 bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            Post
          </Button>
        </DialogHeader>

        <div className="p-4 pt-2">
          <div className="flex space-x-3">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src="/api/placeholder/48/48" />
              <AvatarFallback>YU</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="w-fit">
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      {selectedAudienceOption && (
                        <selectedAudienceOption.icon className="h-4 w-4" />
                      )}
                      <span className="text-primary font-medium">
                        {selectedAudienceOption?.label}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {audienceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] border-none resize-none text-xl placeholder:text-muted-foreground focus-visible:ring-0 p-0"
              />

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto hover:bg-primary/10"
                  >
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto hover:bg-primary/10"
                  >
                    <Calendar className="h-5 w-5 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto hover:bg-primary/10"
                  >
                    <MapPin className="h-5 w-5 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto hover:bg-primary/10"
                  >
                    <Smile className="h-5 w-5 text-primary" />
                  </Button>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-sm text-muted-foreground">
                    Everyone can reply
                  </div>
                  <span
                    className={`text-sm ${
                      content.length > maxChars
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {content.length}/{maxChars}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
