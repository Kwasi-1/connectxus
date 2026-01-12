import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  ImageIcon,
  Calendar,
  MapPin,
  Smile,
  Globe,
  Users,
  Lock,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import type { Post } from "@/types/global";

interface MobilePostPageProps {
  onPost: (content: string, audience: string) => void;
  quotedPost?: Post | null;
}

export function MobilePostPage({ onPost, quotedPost }: MobilePostPageProps) {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("everyone");
  const maxChars = 280;

  const handlePost = () => {
    if (content.trim() || quotedPost) {
      onPost(content, audience);
      setContent("");
      setAudience("everyone");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isDisabled = (!content.trim() && !quotedPost) || content.length > maxChars;

  const audienceOptions = [
    { value: "everyone", label: "Everyone", icon: Globe },
    { value: "following", label: "Following", icon: Users },
    { value: "private", label: "Private", icon: Lock },
  ];

  const selectedAudienceOption = audienceOptions.find(
    (opt) => opt.value === audience
  );

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold">Draft</span>
        </div>
        <Button
          onClick={handlePost}
          disabled={isDisabled}
          className="rounded-full px-6 bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          Post
        </Button>
      </div>

      <div className="flex-1 p-4">
        <div className="flex space-x-3">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src="/api/placeholder/48/48" />
            <AvatarFallback>YU</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="w-fit border-none p-0 h-auto">
                <SelectValue>
                  <div className="flex items-center space-x-2 text-primary">
                    {selectedAudienceOption && (
                      <selectedAudienceOption.icon className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {selectedAudienceOption?.label}
                    </span>
                    <ChevronDown className="h-4 w-4" />
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
              placeholder={quotedPost ? "Add your comment..." : "What's happening?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] border-none resize-none text-xl placeholder:text-muted-foreground focus-visible:ring-0 p-0"
              autoFocus
            />

            {/* Quoted Post Preview */}
            {quotedPost && (
              <Card className="p-4 border border-border rounded-lg mt-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={quotedPost.author_avatar || quotedPost.author?.avatar} />
                    <AvatarFallback>
                      {(quotedPost.full_name || quotedPost.author?.full_name || quotedPost.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {quotedPost.full_name || quotedPost.author?.full_name || quotedPost.username || 'Unknown'}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        @{quotedPost.username || quotedPost.author?.username || 'unknown'}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-muted-foreground line-clamp-3">
                      {quotedPost.content}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
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
            <div className="text-sm text-primary">
              <Globe className="h-4 w-4 inline mr-1" />
              Everyone can reply
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-2">
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
  );
}
