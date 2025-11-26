import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { submitTutorApplication } from "@/api/mentorship.api";
import { toast as sonnerToast } from "sonner";
import SelectInput from "@/components/shared/SelectInput";
import { useCurrency } from "@/hooks/useCurrency";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const availableSubjects = [
  "DCIT 101",
  "DCIT 201",
  "DCIT 301",
  "DCIT 401",
  "Mathematics",
  "Calculus I",
  "Calculus II",
  "Linear Algebra",
  "Statistics",
  "Programming",
  "Data Science",
  "Web Development",
  "Database Systems",
  "Computer Networks",
  "Software Engineering",
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

export function TutorApplicationForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { currencySymbol } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get application data from navigation state (for editing)
  const existingApplication = location.state?.application;

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [currentSubject, setCurrentSubject] = useState("");
  const [sessionRate, setSessionRate] = useState("");
  const [semesterRate, setSemesterRate] = useState("");
  const [showSemesterRate, setShowSemesterRate] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [experience, setExperience] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("");
  const [motivation, setMotivation] = useState("");
  const [references, setReferences] = useState("");

  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
  });

  // Helper function to parse availability strings (e.g., "Monday: 09:00-10:00")
  const parseAvailabilityString = (
    availStr: string
  ): AvailabilitySlot | null => {
    const match = availStr.match(/^(.+?):\s*(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    if (match) {
      return {
        day: match[1].trim(),
        startTime: match[2],
        endTime: match[3],
      };
    }
    return null;
  };

  // Populate form when editing existing application
  useEffect(() => {
    if (existingApplication) {
      // Set subjects
      if (existingApplication.subjects) {
        setSelectedSubjects(existingApplication.subjects);
      }

      // Set availability
      if (
        existingApplication.availability &&
        Array.isArray(existingApplication.availability)
      ) {
        const parsedSlots = existingApplication.availability
          .map(parseAvailabilityString)
          .filter((slot): slot is AvailabilitySlot => slot !== null);
        setAvailability(parsedSlots);
      }

      // Set text fields
      if (existingApplication.experience)
        setExperience(existingApplication.experience);
      if (existingApplication.qualifications)
        setQualifications(existingApplication.qualifications);
      if (existingApplication.motivation)
        setMotivation(existingApplication.motivation);

      // Note: teaching_style and references might not be in the API response
      // Add them if they exist in your API
    }
  }, [existingApplication]);

  const handleSubjectSelect = (value: string) => {
    if (value && !selectedSubjects.includes(value)) {
      setSelectedSubjects([...selectedSubjects, value]);
      setCurrentSubject("");
    }
  };

  const handleSubjectRemove = (subject: string) => {
    setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
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

    if (selectedSubjects.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one subject to tutor.",
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

      await submitTutorApplication({
        space_id: "",
        subjects: selectedSubjects,
        experience: experience || undefined,
        qualifications: qualifications || undefined,
        motivation: motivation.trim(),
        availability: availabilityStrings,
      });

      sonnerToast.success("Application Submitted!", {
        description:
          "Your tutor application has been submitted successfully. We'll review it within 2-3 business days.",
      });

      navigate("/tutoring");
    } catch (err: any) {
      console.error("Error submitting tutor application:", err);
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
      <div className="">
        <h1 className="text-3xl font-bold mb-2">
          {existingApplication ? "Edit Tutor Application" : "Become a Tutor"}
        </h1>
        <p className="text-muted-foreground">
          {existingApplication
            ? "Update your tutoring application details"
            : "Share your knowledge and help fellow students succeed"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subjects You Can Tutor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SelectInput
                id="subject-select"
                label="Search and select subjects"
                placeholder="Type to search subjects..."
                items={availableSubjects.map((subject) => ({
                  value: subject,
                  label: subject,
                }))}
                onChange={handleSubjectSelect}
                values={{ "subject-select": currentSubject }}
                wrapperClassName="mb-4"
              />

              {selectedSubjects.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">
                    Selected Subjects:
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedSubjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="pr-1">
                        {subject}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => handleSubjectRemove(subject)}
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
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Session Rate */}
              <div>
                <Label htmlFor="session-rate">Session Rate *</Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xl">{currencySymbol}</span>
                  <Input
                    id="session-rate"
                    type="number"
                    placeholder="30"
                    value={sessionRate}
                    onChange={(e) => setSessionRate(e.target.value)}
                    className="w-32"
                    min="0"
                    step="0.50"
                    required
                  />
                  <span className="text-sm text-muted-foreground">
                    per session
                  </span>
                </div>
              </div>

              {/* Toggle for Semester Rate */}
              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="semester-toggle" className="cursor-pointer">
                  Offer semester package?
                </Label>
                <button
                  id="semester-toggle"
                  type="button"
                  onClick={() => {
                    setShowSemesterRate(!showSemesterRate);
                    if (showSemesterRate) setSemesterRate("");
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showSemesterRate ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showSemesterRate ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Semester Rate (Conditional) */}
              {showSemesterRate && (
                <div className="pl-4 border-l-2 border-primary/20">
                  <Label htmlFor="semester-rate">Semester Rate</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl">{currencySymbol}</span>
                    <Input
                      id="semester-rate"
                      type="number"
                      placeholder="306"
                      value={semesterRate}
                      onChange={(e) => setSemesterRate(e.target.value)}
                      className="w-32"
                      min="0"
                      step="0.50"
                    />
                    <span className="text-sm text-muted-foreground">
                      12 sessions
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
                <div>
                  <Label>Day</Label>
                  <Select
                    value={newSlot.day}
                    onValueChange={(value) =>
                      setNewSlot({ ...newSlot, day: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, startTime: e.target.value })
                    }
                    className="mt-2"
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
                    className="mt-2"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleAddAvailability}
                    size="icon"
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {availability.length > 0 && (
                <div className="space-y-2 pt-2">
                  {availability.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">
                        <span className="font-medium">{slot.day}</span>
                        <span className="text-muted-foreground mx-2">•</span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveAvailability(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experience & Qualifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="experience">Teaching Experience *</Label>
                <Textarea
                  id="experience"
                  placeholder="Share your teaching or tutoring experience..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="qualifications">
                  Academic Qualifications *
                </Label>
                <Textarea
                  id="qualifications"
                  placeholder="List your relevant qualifications and achievements..."
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  required
                  rows={3}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teaching Approach</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="teaching-style">Teaching Style *</Label>
                <Textarea
                  id="teaching-style"
                  placeholder="Describe your teaching approach and methods..."
                  value={teachingStyle}
                  onChange={(e) => setTeachingStyle(e.target.value)}
                  required
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="motivation">Why become a tutor? *</Label>
                <Textarea
                  id="motivation"
                  placeholder="Share your motivation and goals..."
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  required
                  rows={3}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>References (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="references">
                  Academic or Professional References
                </Label>
                <Textarea
                  id="references"
                  placeholder="Provide contact information for references..."
                  value={references}
                  onChange={(e) => setReferences(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/tutoring")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? existingApplication
                  ? "Updating..."
                  : "Submitting..."
                : existingApplication
                ? "Update Application"
                : "Submit Application"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
