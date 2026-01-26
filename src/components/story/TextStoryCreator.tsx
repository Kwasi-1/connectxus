import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TEXT_BACKGROUNDS, TEXT_GRADIENTS } from "@/types/storyTypes";
import { cn } from "@/lib/utils";
import { ShareToSelector } from "./ShareToSelector";
import type { AudienceType } from "@/types/storyTypes";

interface TextStoryCreatorProps {
  onComplete: (caption: string, background: string) => void;
  onClose: () => void;
  audienceType?: AudienceType;
  audienceIds?: string[];
  onAudienceSelect?: (type: AudienceType, ids: string[]) => void;
}

export const TextStoryCreator = ({
  onComplete,
  onClose,
  audienceType = "following",
  audienceIds = [],
  onAudienceSelect,
}: TextStoryCreatorProps) => {
  const [caption, setCaption] = useState("");
  const [selectedBg, setSelectedBg] = useState(TEXT_BACKGROUNDS[4].value); 
  const [bgType, setBgType] = useState<"solid" | "gradient">("solid");
  const [showShareToSelector, setShowShareToSelector] = useState(false);

  const handleCreate = () => {
    if (!caption.trim()) return;
    onComplete(caption, selectedBg);
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

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
        <h2 className="text-white font-bold text-lg">Text Story</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShareToSelector(true)}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 px-4"
        >
          {getShareButtonText()}
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center gap-6 px-6 mt-20 mb-8 w-full max-w-5xl">
        <div
          className="w-full max-w-[320px] sm:max-w-sm h-full max-h-[90vh] aspect[9/16] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center p-8 relative shrink-0"
          style={{
            background: selectedBg,
          }}
        >
          <div className="text-center w-full ">
            <p
              className="text-white text-2xl sm:text-3xl font-bold leading-tight break-words"
              style={{
                textShadow: "0 2px 20px rgba(0,0,0,0.3)",
              }}
            >
              {caption || "Your text here..."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-16 sm:w-20 h-[500px]">
          <div
            className="group relative flex gap2 mb-2 bg-white/10 border border-white/30 rounded-full p-1 w-fit transition duration-500"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBgType("solid")}
              className={cn(
                "flex-1 rounded-full px-2 py-1 text-xs",
                bgType === "solid"
                  ? "bg-white hover:bg-white/90 text-black rounded-full"
                  : " text-white hover:bg-white/20 hidden group-hover:inline-block ease-in-out transition duration-500"
              )}
            >
              Solid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBgType("gradient")}
              className={cn(
                "flex-1 rounded-full px-2 py-1 text-xs",
                bgType === "gradient"
                  ? "bg-white hover:bg-white/90 text-black"
                  : " text-white hover:bg-white/20 hidden group-hover:inline-block ease-in-out transition duration-500"
              )}
            >
              Grad
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide scrollbar-thumb-white/20 scrollbar-track-transparent px-1 pt-1">
            <div className="flex flex-col gap-2.5">
              {bgType === "solid"
                ? TEXT_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() => setSelectedBg(bg.value)}
                      className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 transition-all hover:scale-110 shrink-0",
                        selectedBg === bg.value
                          ? "border-white scale-110 shadow-lg ring-2 ring-white/50"
                          : "border-white/30"
                      )}
                      style={{ backgroundColor: bg.value }}
                      title={bg.name}
                      aria-label={`Select ${bg.name} background`}
                    />
                  ))
                : TEXT_GRADIENTS.map((gradient) => (
                    <button
                      key={gradient.name}
                      onClick={() => setSelectedBg(gradient.value)}
                      className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 transition-all hover:scale-110 shrink-0",
                        selectedBg === gradient.value
                          ? "border-white scale-110 shadow-lg ring-2 ring-white/50"
                          : "border-white/30"
                      )}
                      style={{ background: gradient.value }}
                      title={gradient.name}
                      aria-label={`Select ${gradient.name} gradient`}
                    />
                  ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 w-full max-w-[320px] sm:max-w-[400px] bg-gradient-to-t from-black/80 to-transparent pb-6 space-y-4 mr-[100px] pl-4 px-5">
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none min-h-[80px] backdrop-blur-md rounded-xl text-base sm:text-lg w-full ring-0 focus-visible:ring-0 ring-offset-background/50 focus-visible:ring-offset-0"
          maxLength={300}
        />

        <Button
          onClick={handleCreate}
          disabled={!caption.trim()}
          className="w-full bg-white hover:bg-white/90 text-black rounded-full py-5 sm:py-6 font-bold text-base sm:text-lg shadow-lg shadow-primary/40 transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
        >
          Create Story
        </Button>
      </div>

      <ShareToSelector
        isOpen={showShareToSelector}
        onClose={() => setShowShareToSelector(false)}
        onSelect={(type: AudienceType, ids: string[]) => {
          if (onAudienceSelect) {
            onAudienceSelect(type, ids);
          }
          setShowShareToSelector(false);
        }}
        currentAudienceType={audienceType}
        currentAudienceIds={audienceIds}
      />
    </div>
  );
};
