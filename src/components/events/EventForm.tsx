import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, Image as ImageIcon, Tag } from "lucide-react";
import { Event, CreateEventRequest } from "@/api/events.api";
import { uploadFile } from "@/api/files.api";
import { toast } from "sonner";

interface EventFormProps {
  event?: Event;
  onSubmit: (data: Omit<CreateEventRequest, 'space_id'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EVENT_CATEGORIES = [
  "Workshop",
  "Seminar",
  "Conference",
  "Networking",
  "Social",
  "Study Group",
  "Competition",
  "Career Fair",
  "Guest Speaker",
  "Other",
];

export const EventForm = ({ event, onSubmit, onCancel, isSubmitting = false }: EventFormProps) => {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    category: event?.category || "",
    location: event?.location || "",
    venue_details: event?.venue_details || "",
    start_date: event?.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : "",
    end_date: event?.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "",
    timezone: event?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    tags: event?.tags?.join(", ") || "",
    image_url: event?.image_url || "",
    max_attendees: event?.max_attendees?.toString() || "",
    registration_required: event?.registration_required ?? true,
    registration_deadline: event?.registration_deadline
      ? new Date(event.registration_deadline).toISOString().slice(0, 16)
      : "",
    is_public: event?.is_public ?? true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(event?.image_url || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    if (formData.registration_required && formData.registration_deadline) {
      const deadline = new Date(formData.registration_deadline);
      if (deadline >= startDate) {
        toast.error("Registration deadline must be before event start date");
        return;
      }
    }

    let imageUrl = formData.image_url;

    if (imageFile) {
      setIsUploadingImage(true);
      try {
        const uploadResponse = await uploadFile(imageFile);
        imageUrl = uploadResponse.url;
      } catch (error) {
        toast.error("Failed to upload image");
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }

    const submitData: Omit<CreateEventRequest, 'space_id'> = {
      title: formData.title,
      description: formData.description || null,
      category: formData.category,
      location: formData.location || null,
      venue_details: formData.venue_details || null,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      timezone: formData.timezone || null,
      tags: formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [],
      image_url: imageUrl || null,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
      registration_required: formData.registration_required,
      registration_deadline: formData.registration_deadline
        ? new Date(formData.registration_deadline).toISOString()
        : null,
      is_public: formData.is_public,
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="title" className="required">
              Event Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title"
              required
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your event..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="required">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="technology, networking, career"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Date & Time
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date" className="required">
                Start Date & Time
              </Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date" className="required">
                End Date & Time
              </Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              placeholder="America/New_York"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </h3>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Building name or address"
            />
          </div>

          <div>
            <Label htmlFor="venue_details">Venue Details</Label>
            <Textarea
              id="venue_details"
              value={formData.venue_details}
              onChange={(e) => setFormData({ ...formData, venue_details: e.target.value })}
              placeholder="Room number, directions, parking info..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Registration
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="registration_required">Require Registration</Label>
              <p className="text-sm text-muted-foreground">
                Users must register to attend this event
              </p>
            </div>
            <Switch
              id="registration_required"
              checked={formData.registration_required}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, registration_required: checked })
              }
            />
          </div>

          {formData.registration_required && (
            <>
              <div>
                <Label htmlFor="registration_deadline">Registration Deadline</Label>
                <Input
                  id="registration_deadline"
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, registration_deadline: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="max_attendees">Maximum Attendees</Label>
                <Input
                  id="max_attendees"
                  type="number"
                  min="1"
                  value={formData.max_attendees}
                  onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_public">Public Event</Label>
              <p className="text-sm text-muted-foreground">
                Event is visible to non-members
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Event Image
          </h3>

          <div>
            <Label htmlFor="image">Upload Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
          </div>

          {imagePreview && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Event preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isUploadingImage}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploadingImage}>
          {isSubmitting || isUploadingImage ? "Saving..." : event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
};
