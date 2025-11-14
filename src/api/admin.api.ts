import apiClient, { getDefaultSpaceId } from '@/lib/apiClient';

export interface SpaceActivity {
  id: string;
  space_id: string;
  activity_type: string;
  actor_id?: string;
  actor_name?: string;
  description: string;
  metadata?: any;
  created_at: string;
}

export interface SpaceStats {
  name: string;
  slug: string;
  user_count: number;
  post_count: number;
  community_count: number;
  group_count: number;
  first_user_date?: string;
}

export interface DashboardStats {
  total_users: number;
  new_users_month: number;
  total_posts: number;
  total_communities: number;
  total_groups: number;
  pending_reports: number;
  suspensions_month: number;
}

export interface ContentReport {
  id: string;
  space_id: string;
  reporter_id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description?: string;
  status: string;
  priority?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  moderation_notes?: string;
  actions_taken?: any;
  created_at: string;
  updated_at: string;
}

export interface Space {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type?: string;
  logo?: string;
  cover_image?: string;
  location?: string;
  website?: string;
  contact_email?: string;
  phone_number?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSpaceRequest {
  name: string;
  slug: string;
  description?: string;
  type?: string;
  location?: string;
  contact_email?: string;
}

export interface SuspendUserRequest {
  user_id: string;
  suspended_by: string;
  reason: string;
  notes?: string;
  duration_days?: number;
  is_permanent?: boolean;
}

export const adminApi = {
    getSpaces: async (): Promise<Space[]> => {
    const response = await apiClient.get('/spaces');
        const paginatedData = response.data.data;
    return paginatedData?.spaces || [];
  },

  getSpace: async (spaceId: string): Promise<Space> => {
    const response = await apiClient.get(`/spaces/${spaceId}`);
    return response.data.data;
  },

  createSpace: async (data: CreateSpaceRequest): Promise<Space> => {
    const response = await apiClient.post('/spaces', data);
    return response.data.data;
  },

  updateSpace: async (spaceId: string, data: Partial<CreateSpaceRequest>): Promise<Space> => {
    const response = await apiClient.put(`/spaces/${spaceId}`, data);
    return response.data.data;
  },

    getSpaceActivities: async (
    spaceId: string,
    activityType?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SpaceActivity[]> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (activityType && activityType !== 'all') {
      params.append('activity_type', activityType);
    }

    const response = await apiClient.get(`/admin/spaces/${spaceId}/activities?${params}`);
    return response.data.data;
  },

  getSpaceStats: async (spaceId: string): Promise<SpaceStats> => {
    const response = await apiClient.get(`/analytics/metrics/space?space_id=${spaceId}`);
    return response.data.data;
  },

    getDashboardStats: async (spaceId: string): Promise<DashboardStats> => {
    const response = await apiClient.get(`/admin/dashboard/stats?space_id=${spaceId}`);
    return response.data.data;
  },

    suspendUser: async (data: SuspendUserRequest): Promise<void> => {
    await apiClient.put(`/admin/users/${data.user_id}/suspend`, data);
  },

  unsuspendUser: async (userId: string): Promise<void> => {
    await apiClient.put(`/admin/users/${userId}/unsuspend`);
  },

  banUser: async (userId: string, reason: string): Promise<void> => {
    await apiClient.put(`/admin/users/${userId}/ban`, { reason });
  },

    getContentReports: async (
    spaceId: string,
    status?: string,
    contentType?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ContentReport[]> => {
    const params = new URLSearchParams({
      space_id: spaceId,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (status && status !== 'all') {
      params.append('status', status);
    }

    if (contentType && contentType !== 'all') {
      params.append('content_type', contentType);
    }

    const response = await apiClient.get(`/admin/reports?${params}`);
    return response.data.data;
  },

  updateReport: async (
    reportId: string,
    status: string,
    moderationNotes?: string,
    actionsTaken?: any
  ): Promise<ContentReport> => {
    const response = await apiClient.put(`/admin/reports/${reportId}`, {
      status,
      moderation_notes: moderationNotes,
      actions_taken: actionsTaken,
    });
    return response.data.data;
  },

  resolveReport: async (
    reportId: string,
    action: string,
    notes?: string
  ): Promise<void> => {
    await apiClient.put(`/admin/reports/${reportId}/resolve`, {
      action,
      notes,
    });
  },

  escalateReport: async (reportId: string): Promise<void> => {
    await apiClient.put(`/admin/reports/${reportId}/escalate`);
  },

    getUsers: async (spaceId: string, page: number = 1, limit: number = 20): Promise<{ users: any[]; total: number }> => {
    const response = await apiClient.get(`/admin/users`, {
      params: { space_id: spaceId, page, limit },
    });
    return response.data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

    getTutorApplications: async (
    spaceId: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ applications: any[]; page: number; limit: number }> => {
    const response = await apiClient.get(`/admin/applications/tutors`, {
      params: { space_id: spaceId, status, page, limit },
    });
    return response.data.data;
  },

  approveTutorApplication: async (appId: string, notes?: string): Promise<void> => {
    await apiClient.put(`/admin/applications/tutors/${appId}/approve`, { notes });
  },

  rejectTutorApplication: async (appId: string, notes?: string): Promise<void> => {
    await apiClient.put(`/admin/applications/tutors/${appId}/reject`, { notes });
  },

  getMentorApplications: async (
    spaceId: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ applications: any[]; page: number; limit: number }> => {
    const response = await apiClient.get(`/admin/applications/mentors`, {
      params: { space_id: spaceId, status, page, limit },
    });
    return response.data.data;
  },

  approveMentorApplication: async (appId: string, notes?: string): Promise<void> => {
    await apiClient.put(`/admin/applications/mentors/${appId}/approve`, { notes });
  },

  rejectMentorApplication: async (appId: string, notes?: string): Promise<void> => {
    await apiClient.put(`/admin/applications/mentors/${appId}/reject`, { notes });
  },

    getGroups: async (
    spaceId: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ groups: any[]; total: number; page: number; limit: number }> => {
    const response = await apiClient.get(`/admin/groups`, {
      params: { space_id: spaceId, status, page, limit },
    });
    return response.data.data;
  },

  approveGroup: async (groupId: string): Promise<void> => {
    await apiClient.put(`/admin/groups/${groupId}/approve`);
  },

  rejectGroup: async (groupId: string, reason: string): Promise<void> => {
    await apiClient.put(`/admin/groups/${groupId}/reject`, { reason });
  },

  deleteGroup: async (groupId: string): Promise<void> => {
    await apiClient.delete(`/admin/groups/${groupId}`);
  },

    exportData: async (format: 'csv' | 'json', dataType: string): Promise<Blob> => {
    const spaceId = getDefaultSpaceId();
    const response = await apiClient.get(`/admin/export/${dataType}`, {
      params: { space_id: spaceId, format },
      responseType: 'blob',
    });
    return response.data;
  },

    getSettings: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/settings');
    return response.data.data.settings;
  },

  updateSetting: async (key: string, value: any, description?: string): Promise<any> => {
    const response = await apiClient.put(`/admin/settings/${key}`, {
      value: JSON.stringify(value),
      description,
    });
    return response.data.data.setting;
  },

    getUserGrowth: async (spaceId: string, since?: Date): Promise<any[]> => {
    const params = new URLSearchParams({ space_id: spaceId });
    if (since) {
      params.append('since', since.toISOString());
    }
    const response = await apiClient.get(`/admin/analytics/user-growth?${params}`);
    return response.data.data;
  },

  getEngagementMetrics: async (spaceId: string, since?: Date): Promise<any> => {
    const params = new URLSearchParams({ space_id: spaceId });
    if (since) {
      params.append('since', since.toISOString());
    }
    const response = await apiClient.get(`/admin/analytics/engagement?${params}`);
    return response.data.data;
  },

  getActivityAnalytics: async (spaceId: string, since?: Date): Promise<any> => {
    const params = new URLSearchParams({ space_id: spaceId });
    if (since) {
      params.append('since', since.toISOString());
    }
    const response = await apiClient.get(`/admin/analytics/activity?${params}`);
    return response.data.data;
  },

    getAdmins: async (status?: string, page: number = 1, limit: number = 20): Promise<{ admins: any[]; page: number; limit: number }> => {
    const response = await apiClient.get(`/admin/admins`, {
      params: { status, page, limit },
    });
    return response.data.data;
  },

  updateAdminRole: async (userId: string, roles: string[]): Promise<void> => {
    await apiClient.put(`/admin/admins/${userId}/role`, { roles });
  },

  updateAdminStatus: async (userId: string, status: string): Promise<void> => {
    await apiClient.put(`/admin/admins/${userId}/status`, { status });
  },

    getNotifications: async (
    typeFilter?: string,
    priority?: string,
    isRead?: boolean,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: any[]; page: number; limit: number }> => {
    const response = await apiClient.get(`/admin/notifications`, {
      params: { type: typeFilter, priority, is_read: isRead, page, limit },
    });
    return response.data.data;
  },

  markNotificationRead: async (notificationId: string): Promise<void> => {
    await apiClient.put(`/admin/notifications/${notificationId}/read`);
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/admin/notifications/${notificationId}`);
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await apiClient.put('/admin/notifications/read-all');
  },

    getCommunities: async (
    spaceId: string,
    category?: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ communities: any[]; page: number; limit: number }> => {
    const response = await apiClient.get(`/admin/communities`, {
      params: { space_id: spaceId, category, status, page, limit },
    });
    return response.data.data;
  },

  createCommunity: async (data: {
    space_id: string;
    name: string;
    description?: string;
    category: string;
    cover_image?: string;
    is_public: boolean;
    settings?: any;
  }): Promise<any> => {
    const response = await apiClient.post('/admin/communities', data);
    return response.data.data.community;
  },

  updateCommunity: async (communityId: string, data: {
    name: string;
    description?: string;
    category: string;
    cover_image?: string;
    is_public: boolean;
    settings?: any;
  }): Promise<any> => {
    const response = await apiClient.put(`/admin/communities/${communityId}`, data);
    return response.data.data.community;
  },

  deleteCommunity: async (communityId: string): Promise<void> => {
    await apiClient.delete(`/admin/communities/${communityId}`);
  },

  updateCommunityStatus: async (communityId: string, status: string): Promise<any> => {
    const response = await apiClient.put(`/admin/communities/${communityId}/status`, { status });
    return response.data.data.community;
  },

  assignCommunityModerator: async (communityId: string, userId: string, permissions: string[]): Promise<void> => {
    await apiClient.post(`/admin/communities/${communityId}/moderators`, {
      user_id: userId,
      permissions,
    });
  },

    getAnnouncements: async (
    spaceId: string,
    status?: string,
    priority?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ announcements: any[]; page: number; limit: number }> => {
    const response = await apiClient.get(`/admin/announcements`, {
      params: { space_id: spaceId, status, priority, page, limit },
    });
    return response.data.data;
  },

  createAnnouncement: async (data: {
    space_id: string;
    title: string;
    content: string;
    type: string;
    target_audience: string[];
    priority: string;
    scheduled_for?: Date;
    expires_at?: Date;
    attachments?: any;
    is_pinned: boolean;
  }): Promise<any> => {
    const response = await apiClient.post('/admin/announcements', data);
    return response.data.data.announcement;
  },

  updateAnnouncement: async (announcementId: string, data: {
    title: string;
    content: string;
    type: string;
    target_audience: string[];
    priority: string;
    scheduled_for?: Date;
    expires_at?: Date;
    attachments?: any;
    is_pinned: boolean;
  }): Promise<any> => {
    const response = await apiClient.put(`/admin/announcements/${announcementId}`, data);
    return response.data.data.announcement;
  },

  deleteAnnouncement: async (announcementId: string): Promise<void> => {
    await apiClient.delete(`/admin/announcements/${announcementId}`);
  },

  updateAnnouncementStatus: async (announcementId: string, status: string): Promise<any> => {
    const response = await apiClient.put(`/admin/announcements/${announcementId}/status`, { status });
    return response.data.data.announcement;
  },

    getEvents: async (
    spaceId: string,
    status?: string,
    category?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ events: any[]; page: number; limit: number }> => {
    const response = await apiClient.get(`/admin/events`, {
      params: { space_id: spaceId, status, category, page, limit },
    });
    return response.data.data;
  },

  createEvent: async (data: {
    space_id: string;
    title: string;
    description?: string;
    category: string;
    location?: string;
    venue_details?: string;
    start_date: Date;
    end_date: Date;
    timezone?: string;
    tags: string[];
    image_url?: string;
    max_attendees?: number;
    registration_required: boolean;
    registration_deadline?: Date;
    is_public: boolean;
  }): Promise<any> => {
    const response = await apiClient.post('/admin/events', data);
    return response.data.data.event;
  },

  updateEvent: async (eventId: string, data: {
    title: string;
    description?: string;
    category: string;
    location?: string;
    venue_details?: string;
    start_date: Date;
    end_date: Date;
    timezone?: string;
    tags: string[];
    image_url?: string;
    max_attendees?: number;
    registration_required: boolean;
    registration_deadline?: Date;
    is_public: boolean;
  }): Promise<any> => {
    const response = await apiClient.put(`/admin/events/${eventId}`, data);
    return response.data.data.event;
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/admin/events/${eventId}`);
  },

  updateEventStatus: async (eventId: string, status: string): Promise<any> => {
    const response = await apiClient.put(`/admin/events/${eventId}/status`, { status });
    return response.data.data.event;
  },

  getEventRegistrations: async (eventId: string): Promise<any[]> => {
    const response = await apiClient.get(`/admin/events/${eventId}/registrations`);
    return response.data.data.registrations;
  },

    createUser: async (data: {
    space_id: string;
    username: string;
    email: string;
    password: string;
    full_name: string;
    roles: string[];
    status: string;
    department?: string;
    level?: string;
    verified: boolean;
  }): Promise<any> => {
    const response = await apiClient.post('/admin/users', data);
    return response.data.data.user;
  },

  updateUser: async (userId: string, data: {
    full_name?: string;
    email?: string;
    roles?: string[];
    status?: string;
    department?: string;
    level?: string;
    verified?: boolean;
  }): Promise<any> => {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data.data.user;
  },

  resetUserPassword: async (userId: string, newPassword: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/reset-password`, {
      new_password: newPassword,
    });
  },
};
