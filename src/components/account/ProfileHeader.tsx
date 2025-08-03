
import { useState } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/types/global';

interface ProfileHeaderProps {
  user: UserProfile;
  onUserUpdate: (updatedUser: UserProfile) => void;
}

export const ProfileHeader = ({ user, onUserUpdate }: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user.displayName,
    bio: user.bio || '',
    major: user.major || '',
    year: user.year || 1
  });

  const handleSave = () => {
    onUserUpdate({
      ...user,
      displayName: editForm.displayName,
      bio: editForm.bio,
      major: editForm.major,
      year: editForm.year
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      displayName: user.displayName,
      bio: user.bio || '',
      major: user.major || '',
      year: user.year || 1
    });
    setIsEditing(false);
  };

  return (
    <div className="relative">
      {/* Cover Photo */}
      <div className="h-36 bg-gradient-to-r from-blue-400 to-purple-600 relative">
        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-4">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback className="text-4xl">
              {user.displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-8 px-6 pb-4">
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            className="rounded-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        {isEditing ? (
          <div className="space-y-4 max-w-lg">
            <Input
              value={editForm.displayName}
              onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
              placeholder="Display Name"
            />
            <Textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
              placeholder="Bio"
              rows={3}
            />
            <div className="flex gap-3">
              <Input
                value={editForm.major}
                onChange={(e) => setEditForm({...editForm, major: e.target.value})}
                placeholder="Major"
                className="flex-1"
              />
              <Input
                type="number"
                value={editForm.year}
                onChange={(e) => setEditForm({...editForm, year: parseInt(e.target.value)})}
                placeholder="Year"
                className="w-20"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">Save</Button>
              <Button onClick={handleCancel} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              {user.verified && (
                <Badge variant="default">Verified</Badge>
              )}
            </div>
            <p className="text-muted-foreground">@{user.username}</p>
            {user.bio && <p className="text-base text-wrap text-foreground/90 whitespace-pre-line break-words">{user.bio}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {user.major && <span>🎓 {user.major}</span>}
              {user.year && <span>📅 Year {user.year}</span>}
              {user.university && <span>🏫 {user.university}</span>}
            </div>
            <div className="flex gap-6 text-sm">
              <span><strong>{user.following}</strong> Following</span>
              <span><strong>{user.followers}</strong> Followers</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
