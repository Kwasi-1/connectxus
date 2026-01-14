export type StoryType = "text" | "image" | "video";
export type AudienceType = "community" | "group" | "following";

export interface FilterMetadata {
  name: string;
  cssClass?: string;
  canvasFilter?: string;
}

export interface StoryData {
  id: string;
  type: StoryType;
  mediaUrl?: string; // Object URL for image/video
  caption?: string;
  backgroundColor?: string; // For text stories
  gradient?: string; // For text stories with gradient
  filter?: FilterMetadata;
  audienceType: AudienceType;
  audienceSelection: string[]; // IDs of communities/groups
  createdAt: string;
  expiresAt: string;
  userId: string;
  username: string;
  userAvatar?: string;
}

export interface Community {
  id: string;
  name: string;
  avatar?: string;
  memberCount: number;
}

export interface Group {
  id: string;
  name: string;
  avatar?: string;
  memberCount: number;
}

// Available filters for images and videos
export const IMAGE_FILTERS: FilterMetadata[] = [
  { name: "None", cssClass: "" },
  { name: "Grayscale", cssClass: "grayscale" },
  { name: "Sepia", cssClass: "sepia" },
  { name: "Saturate", cssClass: "saturate-150" },
  { name: "Warm", cssClass: "brightness-110 saturate-110" },
  { name: "Cool", cssClass: "hue-rotate-180" },
  { name: "Vintage", cssClass: "sepia brightness-90 contrast-110" },
  { name: "Bright", cssClass: "brightness-125" },
  { name: "Contrast", cssClass: "contrast-125" },
  { name: "Fade", cssClass: "opacity-80 brightness-110" },
];

// Background colors and gradients for text stories
export const TEXT_BACKGROUNDS = [
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#10B981" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Black", value: "#000000" },
];

export const TEXT_GRADIENTS = [
  {
    name: "Sunset",
    value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  { name: "Ocean", value: "linear-gradient(135deg, #667eea 0%, #00d4ff 100%)" },
  {
    name: "Forest",
    value: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
  },
  {
    name: "Fire",
    value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  { name: "Sky", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  {
    name: "Berry",
    value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    name: "Night",
    value: "linear-gradient(135deg, #2c3e50 0%, #000000 100%)",
  },
  {
    name: "Rainbow",
    value:
      "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
  },
];
