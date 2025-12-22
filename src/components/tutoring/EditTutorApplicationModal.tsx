
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TutorApplication } from '@/types/applications';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditTutorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: TutorApplication;
  onSave: (updatedApplication: TutorApplication) => void;
}

const availableSubjects = [
  'DCIT 101', 'DCIT 201', 'DCIT 301', 'DCIT 401',
  'Mathematics', 'Calculus I', 'Calculus II', 'Linear Algebra',
  'Statistics', 'Programming', 'Data Science', 'Web Development'
];

export function EditTutorApplicationModal({
  isOpen,
  onClose,
  application,
  onSave
}: EditTutorApplicationModalProps) {
  const { toast } = useToast();
  const [subject, setSubject] = useState(application.subject || '');
  const [hourlyRate, setHourlyRate] = useState(application.hourlyRate?.toString() || '');
  const [teachingStyle, setTeachingStyle] = useState(application.teachingStyle);
  const [motivation, setMotivation] = useState(application.motivation);
  const [customSubject, setCustomSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubjectSelect = (selectedSubject: string) => {
    setSubject(selectedSubject);
  };

  const handleAddCustomSubject = () => {
    if (customSubject.trim()) {
      setSubject(customSubject.trim());
      setCustomSubject('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedApplication: TutorApplication = {
      ...application,
      subject,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      teachingStyle,
      motivation,
    };

    onSave(updatedApplication);
    toast({
      title: "Application Updated",
      description: "Your tutor application has been updated successfully.",
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tutor Application</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Subject (Select One)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {availableSubjects.map(subjectOption => (
                <Button
                  key={subjectOption}
                  type="button"
                  variant={subject === subjectOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSubjectSelect(subjectOption)}
                  className="justify-start text-xs"
                >
                  {subjectOption}
                </Button>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
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

            {subject && (
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="secondary" className="pr-1">
                  Selected: {subject}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setSubject('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="hourlyRate">Hourly Rate (Optional)</Label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl">$</span>
              <Input
                id="hourlyRate"
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
          </div>

          <div>
            <Label htmlFor="teachingStyle">Teaching Style</Label>
            <Textarea
              id="teachingStyle"
              value={teachingStyle}
              onChange={(e) => setTeachingStyle(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="motivation">Motivation</Label>
            <Textarea
              id="motivation"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
