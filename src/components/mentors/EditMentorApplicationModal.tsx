
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MentorApplication } from '@/types/applications';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditMentorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: MentorApplication;
  onSave: (updatedApplication: MentorApplication) => void;
}

const industries = [
  'Technology', 'Business', 'Finance', 'Healthcare', 'Education',
  'Engineering', 'Marketing', 'Design', 'Entrepreneurship', 'Consulting'
];

const commonSpecialties = [
  'Career Development', 'Leadership', 'Project Management', 'Networking',
  'Interview Preparation', 'Resume Building', 'Startup Strategy', 'Sales'
];

export function EditMentorApplicationModal({ 
  isOpen, 
  onClose, 
  application, 
  onSave 
}: EditMentorApplicationModalProps) {
  const { toast } = useToast();
  const [industry, setIndustry] = useState(application.industry);
  const [company, setCompany] = useState(application.company || '');
  const [position, setPosition] = useState(application.position || '');
  const [experience, setExperience] = useState(application.experience.toString());
  const [specialties, setSpecialties] = useState(application.specialties);
  const [motivation, setMotivation] = useState(application.motivation);
  const [approachDescription, setApproachDescription] = useState(application.approachDescription);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSpecialtyAdd = (specialty: string) => {
    if (!specialties.includes(specialty)) {
      setSpecialties([...specialties, specialty]);
    }
  };

  const handleSpecialtyRemove = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  const handleAddCustomSpecialty = () => {
    if (customSpecialty.trim() && !specialties.includes(customSpecialty.trim())) {
      setSpecialties([...specialties, customSpecialty.trim()]);
      setCustomSpecialty('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedApplication: MentorApplication = {
      ...application,
      industry,
      company,
      position,
      experience: parseInt(experience),
      specialties,
      motivation,
      approachDescription,
    };

    onSave(updatedApplication);
    toast({
      title: "Application Updated",
      description: "Your mentor application has been updated successfully.",
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Mentor Application</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                className="w-full p-2 border rounded-md mt-2"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                min="1"
                max="50"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Google, Microsoft"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g., Senior Engineer"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label>Specialties</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {commonSpecialties.map(specialty => (
                <Button
                  key={specialty}
                  type="button"
                  variant={specialties.includes(specialty) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSpecialtyAdd(specialty)}
                  className="justify-start text-xs"
                >
                  {specialty}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add custom specialty..."
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSpecialty())}
              />
              <Button type="button" onClick={handleAddCustomSpecialty}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {specialties.map(specialty => (
                  <Badge key={specialty} variant="secondary" className="pr-1">
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
            )}
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

          <div>
            <Label htmlFor="approach">Mentoring Approach</Label>
            <Textarea
              id="approach"
              value={approachDescription}
              onChange={(e) => setApproachDescription(e.target.value)}
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
