import { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Paperclip, X, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createAssignment } from '@/api/assignments.api';
import { uploadFile } from '@/api/files.api';
import { useAuth } from '@/contexts/AuthContext';

export default function PostAssignment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    subject_type: 'course',
    price: '',
    gift: '',
    deadline: '',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const allowedTypes = [
        'image/',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/',
      ];

      const isValidType = allowedTypes.some((type) => file.type.startsWith(type));
      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > 5) {
      toast.error('You can only upload up to 5 files');
      const allowedCount = 5 - selectedFiles.length;
      validFiles.splice(allowedCount);
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      let attachments: string[] = [];

      if (selectedFiles.length > 0) {
        setIsUploadingFiles(true);
        const uploadPromises = selectedFiles.map((file) =>
          uploadFile({
            file,
            moduleType: 'assignments',
            accessLevel: 'public',
          })
        );

        const uploadedFiles = await Promise.all(uploadPromises);
        attachments = uploadedFiles.map((file) => file.url);
        setIsUploadingFiles(false);
      }

      const requestData: any = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject || undefined,
        subject_type: formData.subject_type,
        price: formData.price,
        gift: formData.gift || undefined,
        deadline: new Date(formData.deadline).toISOString(),
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      await createAssignment(requestData);
      toast.success('Assignment posted successfully!');
      navigate('/assignments');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to post assignment');
    } finally {
      setLoading(false);
      setIsUploadingFiles(false);
    }
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 max-w-4xl mx-auto custom-fonts">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/assignments')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
          <h1 className="text-3xl font-bold mb-2">Post New Assignment</h1>
          <p className="text-muted-foreground">
            Share your assignment and get help from other students
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border rounded-lg p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Assignment Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Help with DCIT 101 Assignment 3"
                required
                minLength={3}
                maxLength={255}
              />
              <p className="text-sm text-muted-foreground">
                Give your assignment a clear, descriptive title
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what help you need with this assignment..."
                required
                minLength={10}
                rows={6}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Provide detailed information about the assignment
              </p>
            </div>

            {/* Subject and Subject Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject / Course Code</Label>
                <Input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="e.g., DCIT 101, Mathematics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject_type">Subject Type</Label>
                <select
                  id="subject_type"
                  value={formData.subject_type}
                  onChange={(e) =>
                    setFormData({ ...formData, subject_type: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="course">Course</option>
                  <option value="other">Other</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            {/* Price and Gift */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (GHS) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  How much are you offering for help?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gift">Additional Gift/Reward</Label>
                <Input
                  id="gift"
                  type="text"
                  value={formData.gift}
                  onChange={(e) =>
                    setFormData({ ...formData, gift: e.target.value })
                  }
                  placeholder="e.g., Lunch, Coffee"
                />
                <p className="text-sm text-muted-foreground">
                  Optional: Any additional rewards
                </p>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">
                Deadline <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                required
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-sm text-muted-foreground">
                When do you need help by?
              </p>
            </div>

            {/* File Attachments */}
            <div className="space-y-2">
              <Label>
                Attachments <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <div className="space-y-3">
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
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
                          onClick={() => handleRemoveFile(index)}
                          disabled={loading || isUploadingFiles}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || isUploadingFiles || selectedFiles.length >= 5}
                  className="w-full"
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  {selectedFiles.length > 0
                    ? `Add More Files (${selectedFiles.length}/5)`
                    : 'Attach Files'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload assignment documents, images, or other relevant files (Max 5 files, 10MB each)
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/assignments')}
              disabled={loading || isUploadingFiles}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isUploadingFiles}>
              {isUploadingFiles ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading Files...
                </>
              ) : loading ? (
                'Posting...'
              ) : (
                'Post Assignment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
