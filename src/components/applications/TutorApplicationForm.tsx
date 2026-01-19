import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Clock, Paperclip, FileText, Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { submitTutorApplication, updateTutorApplication } from "@/api/tutoring.api";
import { uploadFile } from "@/api/files.api";
import { toast as sonnerToast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const subjectTypes = [
  { value: "course", label: "Course (e.g., DCIT 101)" },
  { value: "general", label: "General (e.g., Mathematics)" },
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
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingApplication = location.state?.application;
  const isApproved = existingApplication?.status === "approved";

  const [subject, setSubject] = useState("");
  const [sessionRate, setSessionRate] = useState("");
  const [semesterRate, setSemesterRate] = useState("");
  const [discount, setDiscount] = useState("");
  const [subjectType, setSubjectType] = useState("");
  const [level, setLevel] = useState("");
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [experience, setExperience] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("");
  const [motivation, setMotivation] = useState("");
  const [attachments, setAttachments] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [isUploadingAttachmentFiles, setIsUploadingAttachmentFiles] = useState(false);
  const attachmentFilesInputRef = useRef<HTMLInputElement>(null);

  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
  });

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

  useEffect(() => {
    if (existingApplication) {
      if (existingApplication.subject) setSubject(existingApplication.subject);
      if (existingApplication.session_rate)
        setSessionRate(existingApplication.session_rate.toString());
      if (existingApplication.semester_rate)
        setSemesterRate(existingApplication.semester_rate.toString());
      if (existingApplication.discount)
        setDiscount(existingApplication.discount.toString());
      if (existingApplication.subject_type)
        setSubjectType(existingApplication.subject_type);
      if (existingApplication.level) setLevel(existingApplication.level);

      if (
        existingApplication.availability &&
        Array.isArray(existingApplication.availability)
      ) {
        const parsedSlots = existingApplication.availability
          .map(parseAvailabilityString)
          .filter((slot): slot is AvailabilitySlot => slot !== null);
        setAvailability(parsedSlots);
      }

      if (existingApplication.experience)
        setExperience(existingApplication.experience);
      if (existingApplication.qualifications)
        setQualifications(existingApplication.qualifications);
      if (existingApplication.motivation)
        setMotivation(existingApplication.motivation);
      if (existingApplication.teaching_style)
        setTeachingStyle(existingApplication.teaching_style);
      if (existingApplication.attachments)
        setAttachments(existingApplication.attachments);
    }
  }, [existingApplication]);

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

  const handleAttachmentFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/',
      ];

      const isValidType = allowedTypes.some((type) => file.type.startsWith(type));
      if (!isValidType) {
        sonnerToast.error(`${file.name} is not a supported file type`);
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        sonnerToast.error(`${file.name} is larger than 5MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    const totalFiles = attachmentFiles.length + validFiles.length;
    if (totalFiles > 3) {
      sonnerToast.error('You can only upload up to 3 attachment files');
      const allowedCount = 3 - attachmentFiles.length;
      validFiles.splice(allowedCount);
    }

    setAttachmentFiles([...attachmentFiles, ...validFiles]);
  };

  const handleRemoveAttachmentFile = (index: number) => {
    setAttachmentFiles(attachmentFiles.filter((_, i) => i !== index));
  };

  const handleRemoveAvailability = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject to tutor.",
        variant: "destructive",
      });
      return;
    }

    if (!subjectType) {
      toast({
        title: "Error",
        description: "Please select a subject type.",
        variant: "destructive",
      });
      return;
    }

    if (!level) {
      toast({
        title: "Error",
        description: "Please select a level.",
        variant: "destructive",
      });
      return;
    }

    const levelNum = parseInt(level);
    const userLevelNum = user?.level ? parseInt(user.level) : 0;
    if (levelNum !== 0 && userLevelNum !== 0 && levelNum > userLevelNum) {
      toast({
        title: "Error",
        description: `You can only tutor at levels ≤ your level (${user?.level || "N/A"}).`,
        variant: "destructive",
      });
      return;
    }

    if (!sessionRate || parseFloat(sessionRate) < 0) {
      toast({
        title: "Error",
        description: "Please provide a valid session rate.",
        variant: "destructive",
      });
      return;
    }

    if (!semesterRate || parseFloat(semesterRate) < 0) {
      toast({
        title: "Error",
        description: "Please provide a valid semester rate.",
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
      let attachmentUrls: string | undefined = attachments || undefined;

      if (attachmentFiles.length > 0) {
        setIsUploadingAttachmentFiles(true);
        const uploadPromises = attachmentFiles.map((file) =>
          uploadFile({
            file,
            moduleType: 'tutoring',
            accessLevel: 'public',
          })
        );
        const uploadedFiles = await Promise.all(uploadPromises);
        attachmentUrls = uploadedFiles.map((file) => file.url).join('\n');
        setIsUploadingAttachmentFiles(false);
      }

      const availabilityStrings = availability.map(
        (slot) => `${slot.day}: ${slot.startTime}-${slot.endTime}`
      );

      const applicationData = {
        space_id: "",
        subject: subject.trim(),
        session_rate: sessionRate,
        semester_rate: semesterRate,
        discount: discount || "0",
        subject_type: subjectType,
        level: level || undefined,
        experience: experience || undefined,
        qualifications: qualifications || undefined,
        teaching_style: teachingStyle || undefined,
        motivation: motivation.trim(),
        attachments: attachmentUrls,
        availability: availabilityStrings,
      };

      if (existingApplication && existingApplication.id) {
        await updateTutorApplication(existingApplication.id, applicationData);
        sonnerToast.success("Application Updated!", {
          description:
            "Your tutor application has been updated successfully.",
        });
      } else {
        await submitTutorApplication(applicationData);
        sonnerToast.success("Application Submitted!", {
          description:
            "Your tutor application has been submitted successfully. We'll review it within 2-3 business days.",
        });
      }

      navigate("/tutoring");
    } catch (err: any) {
      console.error("Error submitting tutor application:", err);
      sonnerToast.error(
        existingApplication ? "Failed to update application" : "Failed to submit application",
        {
          description:
            err.response?.data?.error?.message ||
            err.message ||
            "Please try again later.",
        }
      );
    } finally {
      setIsSubmitting(false);
      setIsUploadingAttachmentFiles(false);
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

      {isApproved && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900">Application Approved</h3>
            <p className="text-sm text-blue-700 mt-1">
              Your application has been approved! You can only update your <strong>Session Rate</strong>, <strong>Semester Rate</strong>, and <strong>Availability</strong>.
              All other fields are locked.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject/Course *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., DCIT 101 or Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  disabled={isApproved}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter one subject or course per application
                </p>
              </div>

              <div>
                <Label htmlFor="subject-type">Subject Type *</Label>
                <Select value={subjectType} onValueChange={setSubjectType} disabled={isApproved}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Level *</Label>
                <Select value={level} onValueChange={setLevel} disabled={isApproved} required>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Levels</SelectItem>
                    {[100, 200, 300, 400].map((lvl) => {
                      const userLevelNum = user?.level ? parseInt(user.level) : 0;
                      if (userLevelNum === 0 || lvl <= userLevelNum) {
                        return (
                          <SelectItem key={lvl} value={lvl.toString()}>
                            Level {lvl}
                          </SelectItem>
                        );
                      }
                      return null;
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select the level you can tutor (must be ≤ your level: {user?.level || "N/A"})
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div>
                <Label htmlFor="semester-rate">Semester Rate *</Label>
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
                    required
                  />
                  <span className="text-sm text-muted-foreground">
                    12 sessions package
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="discount">Discount % (Optional)</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="discount"
                    type="number"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    disabled={isApproved}
                    className="w-32"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <span className="text-sm text-muted-foreground">
                    % off (for promotions)
                  </span>
                </div>
              </div>
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
                  disabled={isApproved}
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
                  disabled={isApproved}
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
                  disabled={isApproved}
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
                  disabled={isApproved}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachments (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>
                  Attachments & Credentials
                </Label>
                <div className="space-y-3 mt-3">
                  {attachmentFiles.length > 0 && (
                    <div className="space-y-2">
                      {attachmentFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAttachmentFile(index)}
                            disabled={isSubmitting || isUploadingAttachmentFiles}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    ref={attachmentFilesInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleAttachmentFilesSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => attachmentFilesInputRef.current?.click()}
                    disabled={isApproved || isSubmitting || isUploadingAttachmentFiles || attachmentFiles.length >= 3}
                    className="w-full"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    {attachmentFiles.length > 0
                      ? `Add More Files (${attachmentFiles.length}/3)`
                      : 'Attach Documents'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Upload supporting documents, certificates, or credentials (PDF, DOC, or images. Max 3 files, 5MB each)
                </p>
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
            <Button type="submit" disabled={isSubmitting || isUploadingAttachmentFiles}>
              {isUploadingAttachmentFiles ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading Files...
                </>
              ) : isSubmitting ? (
                existingApplication ? "Updating..." : "Submitting..."
              ) : (
                existingApplication ? "Update Application" : "Submit Application"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
