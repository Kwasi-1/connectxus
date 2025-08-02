
import { useState } from 'react';
import { Edit, LogOut, Users, BookOpen, MessageSquare, Settings } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockUserProfile } from '@/data/mockData';
import { UserProfile } from '@/types/global';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Account = () => {
  const [user, setUser] = useState<UserProfile>(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user.displayName,
    bio: user.bio || '',
    major: user.major || '',
    year: user.year || 1
  });

  const handleSave = () => {
    setUser({
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

  const handleLogout = () => {
    console.log('Logout clicked');
    // Future: Implement logout logic
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback className="text-2xl">
                  {user.displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <div className="space-y-3">
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
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">{user.displayName}</h1>
                      {user.verified && (
                        <Badge variant="default">Verified</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">@{user.username}</p>
                    {user.bio && <p className="mb-3">{user.bio}</p>}
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
                      {user.major && <span>{user.major}</span>}
                      {user.year && <span>• Year {user.year}</span>}
                      {user.university && <span>• {user.university}</span>}
                    </div>
                    <div className="flex gap-6 text-sm">
                      <span><strong>{user.followers}</strong> followers</span>
                      <span><strong>{user.following}</strong> following</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Posts ({user.posts.length})
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Groups ({user.joinedGroups.length})
            </TabsTrigger>
            <TabsTrigger value="tutoring" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Tutoring ({user.tutoringRequests.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {user.posts.length > 0 ? (
              user.posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <p className="mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{post.likes} likes</span>
                      <span>{post.comments} comments</span>
                      <span>{post.reposts} reposts</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No posts yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            {user.joinedGroups.length > 0 ? (
              user.joinedGroups.map((group) => (
                <Card key={group.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={group.avatar} />
                        <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">{group.members} members • {group.category}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No groups joined yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="tutoring" className="space-y-4">
            {user.tutoringRequests.length > 0 ? (
              user.tutoringRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{request.subject}</h3>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                      </div>
                      <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tutoring requests
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Theme</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Privacy Settings</span>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Account;
