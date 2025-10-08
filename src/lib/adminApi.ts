import { 
  AdminUser, 
  CampusAnnouncement, 
  CampusEvent, 
  GroupManagement, 
  TutorApplication, 
  MentorApplication, 
  ContentModerationItem,
  AdminNotification,
  SystemMetrics
} from '@/types/admin';
import { User } from '@/types/global';

// Mock delay to simulate API calls
const mockDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database - in a real app, this would be handled by the backend
let mockUsers: User[] = [];
let mockAdmins: AdminUser[] = [];
let mockAnnouncements: CampusAnnouncement[] = [];
let mockEvents: CampusEvent[] = [];
let mockGroups: GroupManagement[] = [];
let mockTutorApplications: TutorApplication[] = [];
let mockMentorApplications: MentorApplication[] = [];
let mockReports: ContentModerationItem[] = [];
let mockNotifications: AdminNotification[] = [];

// Initialize with some mock data
const initializeMockData = () => {
  // Mock users
  mockUsers = [
    {
      id: '1',
      username: 'john_doe',
      displayName: 'John Doe',
      email: 'john@university.edu',
      avatar: '/placeholder.svg',
      verified: true,
      followers: 120,
      following: 80,
      createdAt: new Date('2024-01-15'),
      roles: ['student'],
    },
    {
      id: '2',
      username: 'sarah_chen',
      displayName: 'Sarah Chen',
      email: 'sarah@university.edu',
      avatar: '/placeholder.svg',
      verified: true,
      followers: 250,
      following: 150,
      createdAt: new Date('2024-02-10'),
      roles: ['student'],
    },
  ];

  // Mock admins
  mockAdmins = [
    {
      id: 'admin1',
      email: 'admin@university.edu',
      name: 'Admin User',
      role: 'admin',
      permissions: ['user_management', 'content_management', 'community_management'],
      university: 'University of Tech',
      department: 'Computer Science',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      isActive: true,
    },
  ];

  // Mock announcements
  mockAnnouncements = [
    {
      id: '1',
      title: 'System Maintenance Notice',
      content: 'The system will be under maintenance this weekend.',
      type: 'maintenance',
      targetAudience: ['all'],
      priority: 'medium',
      status: 'published',
      authorId: 'admin1',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01'),
    },
  ];

  // Mock events
  mockEvents = [
    {
      id: '1',
      title: 'Tech Career Fair',
      description: 'Annual tech career fair with top companies.',
      category: 'professional',
      location: 'Main Auditorium',
      startDate: new Date('2024-04-15T09:00:00'),
      endDate: new Date('2024-04-15T17:00:00'),
      maxAttendees: 500,
      currentAttendees: 120,
      registrationRequired: true,
      registrationDeadline: new Date('2024-04-10'),
      status: 'published',
      organizer: 'Career Services',
      tags: ['career', 'technology', 'networking'],
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01'),
    },
  ];

  // Mock groups
  mockGroups = [
    {
      id: '1',
      name: 'Computer Science Study Group',
      description: 'A group for CS students to collaborate and study together.',
      category: 'Academic',
      memberCount: 45,
      status: 'active',
      visibility: 'public',
      createdBy: 'John Doe',
      moderators: ['John Doe'],
      flags: 0,
      lastActivity: new Date(),
      createdAt: new Date('2024-02-15'),
      avatarUrl: '/placeholder.svg',
    },
    {
      id: '2',
      name: 'Photography Club',
      description: 'Share your photography skills and organize photo walks around campus.',
      category: 'Creative',
      memberCount: 89,
      status: 'active',
      visibility: 'public',
      createdBy: 'Emma Wilson',
      moderators: ['Emma Wilson'],
      flags: 1,
      lastActivity: new Date('2024-01-14'),
      createdAt: new Date('2023-10-15'),
      avatarUrl: '/placeholder.svg',
    },
    {
      id: '3',
      name: 'Gaming Community',
      description: 'Connect with fellow gamers and organize tournaments.',
      category: 'Entertainment',
      memberCount: 156,
      status: 'suspended',
      visibility: 'public',
      createdBy: 'Mike Johnson',
      moderators: ['Mike Johnson', 'Alex Brown'],
      flags: 3,
      lastActivity: new Date('2024-01-10'),
      createdAt: new Date('2023-11-01'),
      avatarUrl: '/placeholder.svg',
    },
    {
      id: '4',
      name: 'Mathematics Tutoring',
      description: 'Get help with mathematics courses and share study materials.',
      category: 'Academic',
      memberCount: 78,
      status: 'active',
      visibility: 'private',
      createdBy: 'Dr. Smith',
      moderators: ['Dr. Smith', 'Lisa Wang'],
      flags: 0,
      lastActivity: new Date('2024-01-13'),
      createdAt: new Date('2023-08-20'),
      avatarUrl: '/placeholder.svg',
    },
    {
      id: '5',
      name: 'Debate Society',
      description: 'Weekly debates on current affairs and academic topics.',
      category: 'Academic',
      memberCount: 0,
      status: 'pending',
      visibility: 'public',
      createdBy: 'Alice Cooper',
      moderators: [],
      flags: 0,
      lastActivity: new Date(),
      createdAt: new Date('2024-03-20'),
      avatarUrl: '/placeholder.svg',
    },
  ];

  // Mock tutor applications
  mockTutorApplications = [
    {
      id: '1',
      applicantId: '1',
      applicantName: 'John Doe',
      subjects: ['Mathematics', 'Physics'],
      hourlyRate: 25,
      qualifications: 'BSc in Mathematics, Dean\'s List',
      experience: 'Tutored high school students for 2 years',
      availability: [
        { day: 'Monday', startTime: '14:00', endTime: '18:00' },
        { day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
      ],
      status: 'pending',
      submittedAt: new Date('2024-03-10'),
    },
  ];

  // Mock mentor applications
  mockMentorApplications = [
    {
      id: '1',
      applicantId: '2',
      applicantName: 'Sarah Chen',
      industry: 'Technology',
      company: 'Tech Corp',
      position: 'Software Engineer',
      experience: 3,
      specialties: ['Frontend Development', 'UI/UX Design'],
      linkedinProfile: 'https://linkedin.com/in/sarahchen',
      status: 'pending',
      submittedAt: new Date('2024-03-12'),
    },
  ];

  // Mock reports
  mockReports = [
    {
      id: '1',
      type: 'post',
      contentId: 'post123',
      reporterId: '2',
      reporterName: 'Sarah Chen',
      reason: 'Inappropriate content',
      status: 'pending',
      priority: 'medium',
      content: {
        text: 'This is the reported content...',
        author: mockUsers[0],
      },
      createdAt: new Date('2024-03-15'),
    },
  ];

  // Mock notifications
  mockNotifications = [
    {
      id: '1',
      type: 'report',
      title: 'New Content Report',
      message: 'A new post has been reported for review',
      priority: 'medium',
      isRead: false,
      actionRequired: true,
      relatedId: '1',
      createdAt: new Date(),
    },
  ];
};

// Initialize mock data
initializeMockData();

// User Management API
export const userApi = {
  async getUsers(): Promise<User[]> {
    await mockDelay(500);
    return [...mockUsers];
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await mockDelay(300);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('User not found');
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return mockUsers[userIndex];
  },

  async suspendUser(id: string, reason: string): Promise<void> {
    await mockDelay(300);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('User not found');
    
    // In a real app, you'd add suspension fields to the User type
    console.log(`User ${id} suspended for: ${reason}`);
  },

  async banUser(id: string, reason: string): Promise<void> {
    await mockDelay(300);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('User not found');
    
    console.log(`User ${id} banned for: ${reason}`);
  },

  async resetPassword(id: string): Promise<void> {
    await mockDelay(300);
    console.log(`Password reset sent for user ${id}`);
  },

  async deleteUser(id: string): Promise<void> {
    await mockDelay(300);
    mockUsers = mockUsers.filter(u => u.id !== id);
  },
};

// Content Management API
export const contentApi = {
  async getAnnouncements(): Promise<CampusAnnouncement[]> {
    await mockDelay(500);
    return [...mockAnnouncements];
  },

  async createAnnouncement(announcement: Omit<CampusAnnouncement, 'id' | 'createdAt' | 'updatedAt'>): Promise<CampusAnnouncement> {
    await mockDelay(300);
    const newAnnouncement: CampusAnnouncement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockAnnouncements.push(newAnnouncement);
    return newAnnouncement;
  },

  async updateAnnouncement(id: string, updates: Partial<CampusAnnouncement>): Promise<CampusAnnouncement> {
    await mockDelay(300);
    const index = mockAnnouncements.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Announcement not found');
    
    mockAnnouncements[index] = { 
      ...mockAnnouncements[index], 
      ...updates, 
      updatedAt: new Date() 
    };
    return mockAnnouncements[index];
  },

  async deleteAnnouncement(id: string): Promise<void> {
    await mockDelay(300);
    mockAnnouncements = mockAnnouncements.filter(a => a.id !== id);
  },

  async getEvents(): Promise<CampusEvent[]> {
    await mockDelay(500);
    return [...mockEvents];
  },

  async createEvent(event: Omit<CampusEvent, 'id' | 'createdAt' | 'updatedAt' | 'currentAttendees'>): Promise<CampusEvent> {
    await mockDelay(300);
    const newEvent: CampusEvent = {
      ...event,
      id: Date.now().toString(),
      currentAttendees: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockEvents.push(newEvent);
    return newEvent;
  },

  async updateEvent(id: string, updates: Partial<CampusEvent>): Promise<CampusEvent> {
    await mockDelay(300);
    const index = mockEvents.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');
    
    mockEvents[index] = { 
      ...mockEvents[index], 
      ...updates, 
      updatedAt: new Date() 
    };
    return mockEvents[index];
  },

  async deleteEvent(id: string): Promise<void> {
    await mockDelay(300);
    mockEvents = mockEvents.filter(e => e.id !== id);
  },
};

// Groups Management API
export const groupsApi = {
  async getGroups(): Promise<GroupManagement[]> {
    await mockDelay(500);
    return [...mockGroups];
  },

  async createGroup(group: Omit<GroupManagement, 'id' | 'createdAt' | 'lastActivity' | 'flags'>): Promise<GroupManagement> {
    await mockDelay(300);
    const newGroup: GroupManagement = {
      ...group,
      id: Date.now().toString(),
      flags: 0,
      lastActivity: new Date(),
      createdAt: new Date(),
    };
    mockGroups.push(newGroup);
    return newGroup;
  },

  async updateGroup(id: string, updates: Partial<GroupManagement>): Promise<GroupManagement> {
    await mockDelay(300);
    const index = mockGroups.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Group not found');
    
    mockGroups[index] = { ...mockGroups[index], ...updates };
    return mockGroups[index];
  },

  async deleteGroup(id: string): Promise<void> {
    await mockDelay(300);
    mockGroups = mockGroups.filter(g => g.id !== id);
  },

  async assignModerators(groupId: string, moderatorIds: string[]): Promise<void> {
    await mockDelay(300);
    const group = mockGroups.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');
    
    group.moderators = [...new Set([...group.moderators, ...moderatorIds])];
  },

  async assignModerator(groupId: string, moderatorId: string): Promise<void> {
    await this.assignModerators(groupId, [moderatorId]);
  },

  async approveGroup(groupId: string): Promise<void> {
    await mockDelay(300);
    const group = mockGroups.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');
    
    group.status = 'active';
  },

  async rejectGroup(groupId: string, reason: string): Promise<void> {
    await mockDelay(300);
    const group = mockGroups.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');
    
    group.status = 'archived';
  },

  async bulkActionGroups(groupIds: string[], action: string): Promise<void> {
    await mockDelay(500);
    for (const id of groupIds) {
      const group = mockGroups.find(g => g.id === id);
      if (group) {
        switch (action) {
          case 'approve':
            group.status = 'active';
            break;
          case 'suspend':
            group.status = 'suspended';
            break;
          case 'delete':
            mockGroups = mockGroups.filter(g => g.id !== id);
            break;
        }
      }
    }
  },

  async exportGroups(): Promise<void> {
    await mockDelay(1000);
    const csvData = mockGroups.map(group => ({
      id: group.id,
      name: group.name,
      category: group.category,
      memberCount: group.memberCount,
      status: group.status,
      visibility: group.visibility,
      flags: group.flags,
      createdAt: group.createdAt.toISOString(),
    }));
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(csvData[0]).join(",") + "\n" +
      csvData.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "groups_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

// Tutoring & Mentorship API
export const applicationApi = {
  async getTutorApplications(): Promise<TutorApplication[]> {
    await mockDelay(500);
    return [...mockTutorApplications];
  },

  async getMentorApplications(): Promise<MentorApplication[]> {
    await mockDelay(500);
    return [...mockMentorApplications];
  },

  async approveTutorApplication(id: string, reviewerNotes?: string): Promise<TutorApplication> {
    await mockDelay(300);
    const index = mockTutorApplications.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Application not found');
    
    mockTutorApplications[index] = {
      ...mockTutorApplications[index],
      status: 'approved',
      reviewedBy: 'admin1',
      reviewerNotes,
      reviewedAt: new Date(),
    };
    return mockTutorApplications[index];
  },

  async rejectTutorApplication(id: string, reviewerNotes?: string): Promise<TutorApplication> {
    await mockDelay(300);
    const index = mockTutorApplications.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Application not found');
    
    mockTutorApplications[index] = {
      ...mockTutorApplications[index],
      status: 'rejected',
      reviewedBy: 'admin1',
      reviewerNotes,
      reviewedAt: new Date(),
    };
    return mockTutorApplications[index];
  },

  async approveMentorApplication(id: string, reviewerNotes?: string): Promise<MentorApplication> {
    await mockDelay(300);
    const index = mockMentorApplications.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Application not found');
    
    mockMentorApplications[index] = {
      ...mockMentorApplications[index],
      status: 'approved',
      reviewedBy: 'admin1',
      reviewerNotes,
      reviewedAt: new Date(),
    };
    return mockMentorApplications[index];
  },

  async rejectMentorApplication(id: string, reviewerNotes?: string): Promise<MentorApplication> {
    await mockDelay(300);
    const index = mockMentorApplications.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Application not found');
    
    mockMentorApplications[index] = {
      ...mockMentorApplications[index],
      status: 'rejected',
      reviewedBy: 'admin1',
      reviewerNotes,
      reviewedAt: new Date(),
    };
    return mockMentorApplications[index];
  },
};

// Reports API
export const reportsApi = {
  async getReports(): Promise<ContentModerationItem[]> {
    await mockDelay(500);
    return [...mockReports];
  },

  async resolveReport(id: string, action: 'approved' | 'removed'): Promise<ContentModerationItem> {
    await mockDelay(300);
    const index = mockReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');
    
    mockReports[index] = {
      ...mockReports[index],
      status: action,
      reviewedBy: 'admin1',
      reviewedAt: new Date(),
    };
    return mockReports[index];
  },

  async escalateReport(id: string): Promise<ContentModerationItem> {
    await mockDelay(300);
    const index = mockReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');
    
    mockReports[index] = {
      ...mockReports[index],
      priority: 'urgent',
    };
    return mockReports[index];
  },
};

// Admin Management API
export const adminApi = {
  async getAdmins(): Promise<AdminUser[]> {
    await mockDelay(500);
    return [...mockAdmins];
  },

  async createAdmin(admin: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin'>): Promise<AdminUser> {
    await mockDelay(300);
    const newAdmin: AdminUser = {
      ...admin,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    mockAdmins.push(newAdmin);
    return newAdmin;
  },

  async updateAdmin(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    await mockDelay(300);
    const index = mockAdmins.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Admin not found');
    
    mockAdmins[index] = { ...mockAdmins[index], ...updates };
    return mockAdmins[index];
  },

  async deactivateAdmin(id: string): Promise<AdminUser> {
    await mockDelay(300);
    const index = mockAdmins.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Admin not found');
    
    mockAdmins[index] = { ...mockAdmins[index], isActive: false };
    return mockAdmins[index];
  },
};

// Notifications API
export const notificationsApi = {
  async getNotifications(): Promise<AdminNotification[]> {
    await mockDelay(500);
    return [...mockNotifications];
  },

  async markAsRead(id: string): Promise<AdminNotification> {
    await mockDelay(300);
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Notification not found');
    
    mockNotifications[index] = { ...mockNotifications[index], isRead: true };
    return mockNotifications[index];
  },

  async markAllAsRead(): Promise<void> {
    await mockDelay(300);
    mockNotifications.forEach(notification => {
      notification.isRead = true;
    });
  },

  async clearAll(): Promise<void> {
    await mockDelay(300);
    mockNotifications.length = 0;
  },
};

// Analytics API
export const analyticsApi = {
  async getMetrics(): Promise<SystemMetrics> {
    await mockDelay(500);
    return {
      totalUsers: mockUsers.length,
      activeUsers: Math.floor(mockUsers.length * 0.7),
      totalPosts: 1250,
      totalGroups: mockGroups.length,
      totalEvents: mockEvents.length,
      reportedContent: mockReports.length,
      pendingApplications: mockTutorApplications.filter(a => a.status === 'pending').length + 
                          mockMentorApplications.filter(a => a.status === 'pending').length,
      systemHealth: 'good',
      lastUpdated: new Date(),
    };
  },

  async exportData(type: 'csv' | 'pdf', dataType: string): Promise<Blob> {
    await mockDelay(1000);
    // Mock file generation
    const content = `Mock ${type.toUpperCase()} export for ${dataType}\nGenerated on: ${new Date().toISOString()}`;
    return new Blob([content], { type: type === 'csv' ? 'text/csv' : 'application/pdf' });
  },
};

// System Settings API
export const systemApi = {
  async getSettings(): Promise<Record<string, any>> {
    await mockDelay(500);
    return {
      maintenanceMode: false,
      registrationOpen: true,
      systemNotice: '',
      theme: 'default',
      brandingEnabled: true,
    };
  },

  async updateSettings(settings: Record<string, any>): Promise<void> {
    await mockDelay(300);
    console.log('Settings updated:', settings);
  },
};