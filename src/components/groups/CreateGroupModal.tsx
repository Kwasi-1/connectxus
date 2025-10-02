import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Calendar } from 'lucide-react';
import { GroupCategory } from '@/types/communities';
import { useToast } from '@/hooks/use-toast';

interface ProjectRole {
  id: string;
  name: string;
  description: string;
  slots: number;
}

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: any) => void;
}

const categoryOptions: GroupCategory[] = [
  'Study Group', 'Sports', 'Arts', 'Professional', 'Academic', 'Social', 'Other'
];

export function CreateGroupModal({ open, onClose, onCreateGroup }: CreateGroupModalProps) {
  const { toast } = useToast();
  const [groupType, setGroupType] = useState<'public' | 'private' | 'project'>('public');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GroupCategory>('Study Group');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Project-specific fields
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [projectDeadline, setProjectDeadline] = useState('');
  const [currentRole, setCurrentRole] = useState({ name: '', description: '', slots: 1 });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddRole = () => {
    if (currentRole.name.trim() && currentRole.slots > 0) {
      setProjectRoles([
        ...projectRoles,
        {
          id: `role-${Date.now()}`,
          ...currentRole
        }
      ]);
      setCurrentRole({ name: '', description: '', slots: 1 });
    }
  };

  const handleRemoveRole = (roleId: string) => {
    setProjectRoles(projectRoles.filter(r => r.id !== roleId));
  };

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (groupType === 'project' && projectRoles.length === 0) {
      toast({
        title: "Missing Roles",
        description: "Please add at least one role for the project",
        variant: "destructive"
      });
      return;
    }

    const groupData = {
      name,
      description,
      category,
      tags,
      groupType,
      ...(groupType === 'project' && {
        projectRoles: projectRoles.map(role => ({
          ...role,
          slotsFilled: 0,
          applications: []
        })),
        projectDeadline: projectDeadline ? new Date(projectDeadline) : undefined,
        isAcceptingApplications: true
      })
    };

    onCreateGroup(groupData);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setCategory('Study Group');
    setTags([]);
    setGroupType('public');
    setProjectRoles([]);
    setProjectDeadline('');
    setCurrentRole({ name: '', description: '', slots: 1 });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Type Selection */}
          <div className="space-y-2">
            <Label>Group Type</Label>
            <Select value={groupType} onValueChange={(value: any) => setGroupType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can join</SelectItem>
                <SelectItem value="private">Private - Requires approval</SelectItem>
                <SelectItem value="project">Project-Based - Role applications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your group"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(value: GroupCategory) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tags"
              />
              <Button type="button" onClick={handleAddTag} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Project-Based Group Fields */}
          {groupType === 'project' && (
            <>
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold">Project Roles</h3>
                
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={currentRole.name}
                      onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                      placeholder="e.g., Frontend Developer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roleDesc">Role Description</Label>
                    <Input
                      id="roleDesc"
                      value={currentRole.description}
                      onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                      placeholder="What will this role do?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roleSlots">Number of Slots</Label>
                    <Input
                      id="roleSlots"
                      type="number"
                      min="1"
                      value={currentRole.slots}
                      onChange={(e) => setCurrentRole({ ...currentRole, slots: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  <Button type="button" onClick={handleAddRole} size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </div>

                {/* Display Added Roles */}
                {projectRoles.length > 0 && (
                  <div className="space-y-2">
                    {projectRoles.map(role => (
                      <div key={role.id} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">{role.slots} slot(s)</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRole(role.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="deadline"
                    type="date"
                    value={projectDeadline}
                    onChange={(e) => setProjectDeadline(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Group
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
