import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Clock } from "lucide-react";
import { mockCampusHighlightStories } from "@/data/mockStories";

const HighlightStories = () => {
  const navigate = useNavigate();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(
    null
  );
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filters = ["All", "Communities", "Following", "Others"];

  const featuredStories = mockCampusHighlightStories.filter(
    (story) => story.category
  );
  const regularStories = mockCampusHighlightStories.filter(
    (story) => !story.category
  );

  const getTimeAgo = (createdAt: string) => {
    const now = Date.now();
    const timestamp = new Date(createdAt).getTime();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <>
      
    </>
  );
};

export default HighlightStories;
