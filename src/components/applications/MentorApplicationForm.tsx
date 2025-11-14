import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Clock, Briefcase, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { submitMentorApplication } from "@/api/mentorship.api";
import { toast as sonnerToast } from "sonner";

const industries = [
  "Technology",
  "Business",
  "Finance",
  "Healthcare",
  "Education",
  "Engineering",
  "Marketing",
  "Design",
  "Entrepreneurship",
  "Consulting",
  "Non-profit",
  "Government",
  "Media",
  "Arts",
  "Research",
];

const commonSpecialties = [
  "Career Development",
  "Leadership",
  "Project Management",
  "Networking",
  "Interview Preparation",
  "Resume Building",
  "Startup Strategy",
  "Sales",
  "Product Management",
  "Data Analysis",
  "Digital Marketing",
  "UX/UI Design",
  "Software Development",
  "Financial Planning",
  "Public Speaking",
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export function MentorApplicationForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [industry, setIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [achievements, setAchievements] = useState("");
  const [mentorshipExperience, setMentorshipExperience] = useState("");
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [motivation, setMotivation] = useState("");
  const [approachDescription, setApproachDescription] = useState("");
  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
    day: "Saturday",
    startTime: "10:00",
    endTime: "12:00",
  });

  const handleSpecialtySelect = (specialty: string) => {
    if (!selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };

  const handleSpecialtyRemove = (specialty: string) => {
    setSelectedSpecialties(selectedSpecialties.filter((s) => s !== specialty));
  };

  const handleAddCustomSpecialty = () => {
    if (
      customSpecialty.trim() &&
      !selectedSpecialties.includes(customSpecialty.trim())
    ) {
      setSelectedSpecialties([...selectedSpecialties, customSpecialty.trim()]);
      setCustomSpecialty("");
    }
  };

  const handleAddAvailability = () => {
    if (newSlot.day && newSlot.startTime && newSlot.endTime) {
      const slotExists = availability.some(
        (slot) =>
          slot.day === newSlot.day &&
          slot.startTime === newSlot.startTime &&
          slot.endTime === newSlot.endTime
      );

      if (!slotExists) {
        setAvailability([...availability, { ...newSlot }]);
      }
    }
  };

  const handleRemoveAvailability = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!industry) {
      toast({
        title: "Error",
        description: "Please select your industry.",
        variant: "destructive",
      });
      return;
    }

    if (selectedSpecialties.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one specialty area.",
        variant: "destructive",
      });
      return;
    }

    if (availability.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one availability slot.",
        variant: "destructive",
      });
      return;
    }

    if (motivation.trim().length < 50) {
      toast({
        title: "Error",
        description: "Please provide a motivation of at least 50 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const availabilityStrings = availability.map(
        (slot) => `${slot.day}: ${slot.startTime}-${slot.endTime}`
      );

      await submitMentorApplication({
        space_id: "",
        industry,
        company: company || undefined,
        position: position || undefined,
        experience: parseInt(experience) || 0,
        specialties: selectedSpecialties,
        motivation: motivation.trim(),
        availability: availabilityStrings,
      });

      sonnerToast.success("Application Submitted!", {
        description:
          "Your mentor application has been submitted successfully. We'll review it within 3-5 business days.",
      });

      navigate("/mentors");
    } catch (err: any) {
      console.error("Error submitting mentor application:", err);
      sonnerToast.error("Failed to submit application", {
        description:
          err.response?.data?.error?.message ||
          err.message ||
          "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Become a Mentor</h1>
        <p className="text-muted-foreground">
          Guide the next generation of professionals
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <select
                  id="industry"
                  className="w-full p-2 border rounded-md"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                >
                  <option value="">Select your industry</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Current Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google, Microsoft, Startup Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="position">Current Position</Label>
                  <Input
                    id="position"
                    placeholder="e.g., Senior Software Engineer, Product Manager"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience *</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="3"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  min="1"
                  max="50"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Areas of Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {commonSpecialties.map((specialty) => (
                  <Button
                    key={specialty}
                    type="button"
                    variant={
                      selectedSpecialties.includes(specialty)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleSpecialtySelect(specialty)}
                    className="justify-start text-sm"
                  >
                    {specialty}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom specialty..."
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddCustomSpecialty())
                  }
                />
                <Button type="button" onClick={handleAddCustomSpecialty}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {selectedSpecialties.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">
                    Selected Specialties:
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedSpecialties.map((specialty) => (
                      <Badge
                        key={specialty}
                        variant="secondary"
                        className="pr-1"
                      >
                        {specialty}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => handleSpecialtyRemove(specialty)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Availability for Mentoring Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Day</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newSlot.day}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, day: e.target.value })
                    }
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, startTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, endTime: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={handleAddAvailability}>
                    Add Slot
                  </Button>
                </div>
              </div>

              {availability.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">
                    Your Availability:
                  </Label>
                  <div className="space-y-2 mt-2">
                    {availability.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span>
                          {slot.day}: {slot.startTime} - {slot.endTime}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAvailability(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Experience & Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="achievements">
                  Key Achievements & Accomplishments *
                </Label>
                <Textarea
                  id="achievements"
                  placeholder="Describe your major professional achievements, awards, promotions, successful projects, or notable contributions to your field..."
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  required
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="mentorship-experience">
                  Previous Mentoring Experience
                </Label>
                <Textarea
                  id="mentorship-experience"
                  placeholder="Describe any formal or informal mentoring, coaching, teaching, or leadership experience you've had..."
                  value={mentorshipExperience}
                  onChange={(e) => setMentorshipExperience(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Mentoring Philosophy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="motivation">
                  Why do you want to become a mentor? *
                </Label>
                <Textarea
                  id="motivation"
                  placeholder="Share your motivation for mentoring students and how you believe you can make a positive impact on their careers..."
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  required
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="approach">Your Mentoring Approach *</Label>
                <Textarea
                  id="approach"
                  placeholder="Describe your mentoring style, how you plan to support mentees, and what methods you'll use to help them achieve their goals..."
                  value={approachDescription}
                  onChange={(e) => setApproachDescription(e.target.value)}
                  required
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Professional Links (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedinProfile}
                  onChange={(e) => setLinkedinProfile(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="portfolio">Portfolio/Website</Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/mentors")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
