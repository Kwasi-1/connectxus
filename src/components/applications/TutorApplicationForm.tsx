
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const availableSubjects = [
  'DCIT 101', 'DCIT 201', 'DCIT 301', 'DCIT 401',
  'Mathematics', 'Calculus I', 'Calculus II', 'Linear Algebra',
  'Statistics', 'Programming', 'Data Science', 'Web Development',
  'Database Systems', 'Computer Networks', 'Software Engineering'
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export function TutorApplicationForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [experience, setExperience] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [teachingStyle, setTeachingStyle] = useState('');
  const [motivation, setMotivation] = useState('');
  const [references, setReferences] = useState('');

  // Availability form state
  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00'
  });

  const handleSubjectSelect = (subject: string) => {
    if (!selectedSubjects.includes(subject)) {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleSubjectRemove = (subject: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
  };

  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      setSelectedSubjects([...selectedSubjects, customSubject.trim()]);
      setCustomSubject('');
    }
  };

  const handleAddAvailability = () => {
    if (newSlot.day && newSlot.startTime && newSlot.endTime) {
      const slotExists = availability.some(slot => 
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
        variant: "destructive"
      });
      return;
    }

    if (availability.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one availability slot.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Application Submitted!",
      description: "Your tutor application has been submitted successfully. We'll review it within 2-3 business days.",
    });

    setIsSubmitting(false);
    navigate('/tutoring');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Become a Tutor</h1>
        <p className="text-muted-foreground">Share your knowledge and help fellow students succeed</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Subjects */}
          <Card>
            <CardHeader>
              <CardTitle>Subjects You Can Tutor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availableSubjects.map(subject => (
                  <Button
                    key={subject}
                    type="button"
                    variant={selectedSubjects.includes(subject) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSubjectSelect(subject)}
                    className="justify-start"
                  >
                    {subject}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom subject..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSubject())}
                />
                <Button type="button" onClick={handleAddCustomSubject}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {selectedSubjects.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Selected Subjects:</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedSubjects.map(subject => (
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

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Rate (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl">$</span>
                <Input
                  type="number"
                  placeholder="25"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-32"
                  min="0"
                  step="0.50"
                />
                <span className="text-muted-foreground">per hour</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Leave blank if you prefer to discuss rates individually with students.
              </p>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Day</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({...newSlot, day: e.target.value})}
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
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
                  <Label className="text-sm font-medium">Your Availability:</Label>
                  <div className="space-y-2 mt-2">
                    {availability.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span>{slot.day}: {slot.startTime} - {slot.endTime}</span>
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

          {/* Experience & Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle>Experience & Qualifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="experience">Teaching/Tutoring Experience *</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe your teaching or tutoring experience, including any relevant coursework, projects, or informal teaching experiences..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="qualifications">Academic Qualifications *</Label>
                <Textarea
                  id="qualifications"
                  placeholder="List your relevant qualifications, grades, certifications, or achievements in the subjects you want to tutor..."
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  required
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Teaching Approach */}
          <Card>
            <CardHeader>
              <CardTitle>Teaching Style & Motivation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="teaching-style">Your Teaching Style *</Label>
                <Textarea
                  id="teaching-style"
                  placeholder="Describe your teaching approach, methods you use, and how you adapt to different learning styles..."
                  value={teachingStyle}
                  onChange={(e) => setTeachingStyle(e.target.value)}
                  required
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="motivation">Why do you want to become a tutor? *</Label>
                <Textarea
                  id="motivation"
                  placeholder="Share your motivation for becoming a tutor and how you plan to help students succeed..."
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  required
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* References */}
          <Card>
            <CardHeader>
              <CardTitle>References (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="references">Professional or Academic References</Label>
                <Textarea
                  id="references"
                  placeholder="Provide contact information for professors, teachers, or supervisors who can vouch for your academic abilities and character..."
                  value={references}
                  onChange={(e) => setReferences(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/tutoring')}>
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
