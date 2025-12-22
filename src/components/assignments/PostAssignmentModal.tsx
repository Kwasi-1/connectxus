import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { createAssignment } from '../../api/assignments.api';
import { CreateAssignmentRequest } from '../../types/assignments';
import { useAuth } from '../../contexts/AuthContext';

interface PostAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PostAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
}: PostAssignmentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_type: '',
    level: user?.level || '',
    price: '',
    gift: '',
    attachments: [] as string[],
    deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const requestData: CreateAssignmentRequest = {
        space_id: user.space_id,
        department_id: user.department_id,
        title: formData.title,
        description: formData.description,
        subject_type: formData.subject_type || undefined,
        level: formData.level || undefined,
        price: formData.price,
        gift: formData.gift || undefined,
        attachments: formData.attachments.length > 0 ? formData.attachments : undefined,
        deadline: new Date(formData.deadline).toISOString(),
      };

      await createAssignment(requestData);
      toast.success('Assignment posted successfully!');
      onSuccess();
      onClose();
      setFormData({
        title: '',
        description: '',
        subject_type: '',
        level: user?.level || '',
        price: '',
        gift: '',
        attachments: [],
        deadline: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to post assignment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">Post New Assignment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              required
              minLength={3}
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 min-h-[120px]"
              required
              minLength={10}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Subject Type
              </label>
              <input
                type="text"
                value={formData.subject_type}
                onChange={(e) =>
                  setFormData({ ...formData, subject_type: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="e.g., Mathematics, Physics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Level</label>
              <input
                type="text"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="e.g., 100, 200, 300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price (GHS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Bonus Gift (GHS)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.gift}
                onChange={(e) =>
                  setFormData({ ...formData, gift: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="Optional bonus"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Attachments (URLs)
            </label>
            <textarea
              value={formData.attachments.join('\n')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attachments: e.target.value.split('\n').filter((url) => url.trim()),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              placeholder="Enter file URLs (one per line)"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Add URLs to your assignment files (one per line)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
