import apiClient, {
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "@/lib/apiClient";

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

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  space_id: string;
  username: string;
  email: string;
  full_name: string;
  avatar?: string | null;
  bio?: string | null;
  role: string;
  department_id?: string | null;
  level?: string | null;
  verified?: boolean;
  created_at?: string;
}

export interface AdminLoginResponse {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  user: AdminUser;
}

export interface AdminGoogleSignInRequest {
  id_token: string;
}

export interface AdminGoogleSignInNewUserResponse {
  new_user: boolean;
  email: string;
  full_name: string;
  avatar: string;
  id_token: string;
  needs_onboarding: boolean;
}

export interface AdminGoogleSignInExistingUserResponse {
  new_user: boolean;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  user: AdminUser;
  needs_onboarding: boolean;
}

export type AdminGoogleSignInResponse = AdminGoogleSignInNewUserResponse | AdminGoogleSignInExistingUserResponse;

export interface SuspendUserRequest {
  user_id: string;
  suspended_by: string;
  reason: string;
  notes?: string;
  duration_days?: number;
  is_permanent?: boolean;
}

export const adminApi = {
  login: async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await apiClient.post<{ data: AdminLoginResponse }>(
      "/users/login",
      data
    );

    const user = response.data.data.user;
    if (
      !user.role ||
      !["admin", "super_admin", "moderator"].includes(user.role)
    ) {
      throw new Error("Something went wrong");
    }

    setAccessToken(response.data.data.access_token);
    setRefreshToken(response.data.data.refresh_token);

    return response.data.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/users/logout");
    } finally {
      clearTokens();
      localStorage.removeItem("admin-user");
    }
  },

  googleSignIn: async (idToken: string): Promise<AdminGoogleSignInResponse> => {
    const response = await apiClient.post<{ data: AdminGoogleSignInResponse }>(
      "/users/auth/google",
      { id_token: idToken }
    );

    const data = response.data.data;

    if (data.needs_onboarding) {
      throw new Error("Account needs onboarding. Please complete registration first.");
    }

    if ('access_token' in data && 'user' in data) {
      const user = data.user;
      
      if (!user.role || !["admin", "super_admin", "moderator"].includes(user.role)) {
        throw new Error("Something went wrong");
      }

      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
    }

    return data;
  },

  getSpaces: async (params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ spaces: Space[]; total: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const url = `/spaces${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiClient.get(url);
    const paginatedData = response.data.data;
    return {
      spaces: paginatedData?.spaces || [],
      total: paginatedData?.total || 0,
    };
  },

  getSpace: async (spaceId: string): Promise<Space> => {
    const response = await apiClient.get(`/spaces/${spaceId}`);
    return response.data.data;
  },

  createSpace: async (data: CreateSpaceRequest): Promise<Space> => {
    const response = await apiClient.post("/spaces", data);
    return response.data.data;
  },

  updateSpace: async (
    spaceId: string,
    data: Partial<CreateSpaceRequest>
  ): Promise<Space> => {
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

    if (activityType && activityType !== "all") {
      params.append("activity_type", activityType);
    }

    const response = await apiClient.get(`/admin/activities?${params}`);
    return response.data.data;
  },

  getSpaceStats: async (spaceId: string): Promise<SpaceStats> => {
    const response = await apiClient.get(`/analytics/metrics/space`);
    return response.data.data;
  },

  getDashboardStats: async (spaceId: string): Promise<DashboardStats> => {
    const response = await apiClient.get(`/admin/dashboard/stats`);
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
    search?: string,
    status?: string,
    contentType?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ reports: ContentReport[]; total: number; limit: number; offset: number }> => {
    const params = new URLSearchParams({
      space_id: spaceId,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    if (status && status !== "all") {
      params.append("status", status);
    }

    if (contentType && contentType !== "all") {
      params.append("content_type", contentType);
    }

    const response = await apiClient.get(`/admin/content-reports?${params}`);
    return response.data.data;
  },

  updateReport: async (
    reportId: string,
    status: string,
    moderationNotes?: string,
    actionsTaken?: any
  ): Promise<ContentReport> => {
    const response = await apiClient.put(`/admin/content-reports/${reportId}`, {
      status,
      moderation_notes: moderationNotes,
      actions_taken: actionsTaken,
    });
    return response.data.data;
  },

  resolveContentReport: async (
    reportId: string,
    action: string,
    notes?: string
  ): Promise<void> => {
    await apiClient.put(`/admin/content-reports/${reportId}/resolve`, {
      action,
      notes,
    });
  },

  escalateContentReport: async (reportId: string): Promise<void> => {
    await apiClient.put(`/admin/content-reports/${reportId}/escalate`);
  },

  getUsers: async (
    spaceId?: string | null,
    search?: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ users: any[]; total: number; limit: number; offset: number }> => {
    const params: any = { limit, offset };
    if (spaceId && spaceId !== "all") {
      params.space_id = spaceId;
    }
    if (search) {
      params.search = search;
    }
    if (status && status !== "all") {
      params.status = status;
    }
    const response = await apiClient.get(`/admin/users`, { params });
    return response.data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  getTutorApplications: async (
    spaceId?: string | null,
    search?: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ applications: any[]; total: number; limit: number; offset: number }> => {
    const params: any = { limit, offset };
    if (spaceId && spaceId !== "all") {
      params.space_id = spaceId;
    }
    if (search) {
      params.search = search;
    }
    if (status && status !== "all") {
      params.status = status;
    }
    const response = await apiClient.get(`/admin/applications/tutors`, {
      params,
    });
    return response.data.data;
  },

  approveTutorApplication: async (
    appId: string,
    notes?: string
  ): Promise<void> => {
    await apiClient.put(`/admin/applications/tutors/${appId}/approve`, {
      notes,
    });
  },

  rejectTutorApplication: async (
    appId: string,
    notes?: string
  ): Promise<void> => {
    await apiClient.put(`/admin/applications/tutors/${appId}/reject`, {
      notes,
    });
  },

  getGroups: async (
    spaceId?: string | null,
    search?: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ groups: any[]; total: number; limit: number; offset: number }> => {
    const params: any = { limit, offset };
    if (spaceId && spaceId !== "all") {
      params.space_id = spaceId;
    }
    if (search) {
      params.search = search;
    }
    if (status && status !== "all") {
      params.status = status;
    }
    const response = await apiClient.get(`/admin/groups`, { params });
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

  exportData: async (
    format: "csv" | "json",
    dataType: string
  ): Promise<Blob> => {
    const response = await apiClient.get(`/admin/export/${dataType}`, {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },

  getSettings: async (): Promise<any[]> => {
    const response = await apiClient.get("/admin/settings");
    return response.data.data.settings;
  },

  updateSetting: async (
    key: string,
    value: any,
    description?: string
  ): Promise<any> => {
    const response = await apiClient.put(`/admin/settings/${key}`, {
      value: value,
      description,
    });
    return response.data.data.setting;
  },

  getUserGrowth: async (spaceId: string, since?: Date): Promise<any[]> => {
    const params = new URLSearchParams();
    if (since) {
      params.append("since", since.toISOString());
    }
    const response = await apiClient.get(
      `/admin/analytics/user-growth?${params}`
    );
    return response.data.data;
  },

  getEngagementMetrics: async (spaceId: string, since?: Date): Promise<any> => {
    const params = new URLSearchParams();
    if (since) {
      params.append("since", since.toISOString());
    }
    const response = await apiClient.get(
      `/admin/analytics/engagement?${params}`
    );
    return response.data.data;
  },

  getActivityAnalytics: async (spaceId: string, since?: Date): Promise<any> => {
    const params = new URLSearchParams();
    if (since) {
      params.append("since", since.toISOString());
    }
    const response = await apiClient.get(`/admin/analytics/activity?${params}`);
    return response.data.data;
  },

  getAdmins: async (
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ admins: any[]; page: number; limit: number }> => {
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
    limit: number = 20,
    spaceId?: string | null
  ): Promise<{ notifications: any[]; page: number; limit: number }> => {
    const params: any = {
      type: typeFilter,
      priority,
      is_read: isRead,
      page,
      limit,
    };
    const response = await apiClient.get(`/admin/notifications`, { params });
    return response.data.data;
  },

  markNotificationRead: async (notificationId: string): Promise<void> => {
    await apiClient.put(`/admin/notifications/${notificationId}/read`);
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/admin/notifications/${notificationId}`);
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await apiClient.put("/admin/notifications/read-all");
  },

  getCommunities: async (
    spaceId?: string | null,
    search?: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ communities: any[]; total: number; limit: number; offset: number }> => {
    const params: any = { limit, offset };
    if (spaceId && spaceId !== "all") {
      params.space_id = spaceId;
    }
    if (search) {
      params.search = search;
    }
    if (status && status !== "all") {
      params.status = status;
    }
    const response = await apiClient.get(`/admin/communities`, { params });
    return response.data.data;
  },

  createCommunity: async (data: {
    name: string;
    description?: string;
    category: string;
    cover_image?: string;
    is_public: boolean;
    settings?: any;
  }): Promise<any> => {
    const response = await apiClient.post("/admin/communities", data);
    return response.data.data.community;
  },

  updateCommunity: async (
    communityId: string,
    data: {
      name: string;
      description?: string;
      category: string;
      cover_image?: string;
      is_public: boolean;
      settings?: any;
    }
  ): Promise<any> => {
    const response = await apiClient.put(
      `/admin/communities/${communityId}`,
      data
    );
    return response.data.data.community;
  },

  deleteCommunity: async (communityId: string): Promise<void> => {
    await apiClient.delete(`/admin/communities/${communityId}`);
  },

  updateCommunityStatus: async (
    communityId: string,
    status: string
  ): Promise<any> => {
    const response = await apiClient.put(
      `/admin/communities/${communityId}/status`,
      { status }
    );
    return response.data.data.community;
  },

  assignCommunityModerator: async (
    communityId: string,
    userId: string,
    permissions: string[]
  ): Promise<void> => {
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
      params: { status, priority, page, limit },
    });
    return response.data.data;
  },

  createAnnouncement: async (data: {
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
    const response = await apiClient.post("/admin/announcements", data);
    return response.data.data.announcement;
  },

  updateAnnouncement: async (
    announcementId: string,
    data: {
      title: string;
      content: string;
      type: string;
      target_audience: string[];
      priority: string;
      scheduled_for?: Date;
      expires_at?: Date;
      attachments?: any;
      is_pinned: boolean;
    }
  ): Promise<any> => {
    const response = await apiClient.put(
      `/admin/announcements/${announcementId}`,
      data
    );
    return response.data.data.announcement;
  },

  deleteAnnouncement: async (announcementId: string): Promise<void> => {
    await apiClient.delete(`/admin/announcements/${announcementId}`);
  },

  updateAnnouncementStatus: async (
    announcementId: string,
    status: string
  ): Promise<any> => {
    const response = await apiClient.put(
      `/admin/announcements/${announcementId}/status`,
      { status }
    );
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
      params: { status, category, page, limit },
    });
    return response.data.data;
  },

  createEvent: async (data: {
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
    const response = await apiClient.post("/admin/events", data);
    return response.data.data.event;
  },

  updateEvent: async (
    eventId: string,
    data: {
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
    }
  ): Promise<any> => {
    const response = await apiClient.put(`/admin/events/${eventId}`, data);
    return response.data.data.event;
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/admin/events/${eventId}`);
  },

  updateEventStatus: async (eventId: string, status: string): Promise<any> => {
    const response = await apiClient.put(`/admin/events/${eventId}/status`, {
      status,
    });
    return response.data.data.event;
  },

  getEventRegistrations: async (eventId: string): Promise<any[]> => {
    const response = await apiClient.get(
      `/admin/events/${eventId}/registrations`
    );
    return response.data.data.registrations;
  },

  createUser: async (data: {
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
    const response = await apiClient.post("/admin/users", data);
    return response.data.data.user;
  },

  updateUser: async (
    userId: string,
    data: {
      full_name?: string;
      email?: string;
      roles?: string[];
      status?: string;
      department?: string;
      level?: string;
      verified?: boolean;
    }
  ): Promise<any> => {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data.data.user;
  },

  resetUserPassword: async (
    userId: string,
    newPassword: string
  ): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/reset-password`, {
      new_password: newPassword,
    });
  },


  getTutoringBusinessOverviewStats: async (spaceId?: string): Promise<{
    total_revenue: string;
    platform_commission: string;
    pending_payouts: string;
    completed_payouts: string;
    total_sessions: number;
    completed_sessions: number;
    pending_disputes: number;
    resolved_disputes: number;
    total_tutors: number;
    total_students: number;
  }> => {
    const response = await apiClient.get(
      "/admin/tutoring-business/overview/stats"
    );
    return response.data.data;
  },

  getTutoringBusinessRevenueHistory: async (
    spaceId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{
      date: string;
      revenue: string;
      commission: string;
      transaction_count: number;
    }>
  > => {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await apiClient.get(
      "/admin/tutoring-business/overview/revenue-history",
      { params }
    );
    return response.data.data;
  },

  getTutoringBusinessTopTutors: async (
    spaceId?: string,
    limit: number = 10
  ): Promise<
    Array<{
      id: string;
      applicant_id: string;
      username: string;
      full_name: string;
      avatar?: string;
      subject: string;
      sessions_completed: number;
      total_earnings: string;
      average_rating: string;
      review_count: number;
    }>
  > => {
    const params: any = { limit };

    const response = await apiClient.get(
      "/admin/tutoring-business/overview/top-tutors",
      { params }
    );
    return response.data.data;
  },

  getTutoringBusinessTransactions: async (params: {
    space_id?: string;
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    transactions: Array<{
      id: string;
      transaction_type: string;
      amount: string;
      currency: string;
      status: string;
      payment_method?: string;
      payment_provider?: string;
      provider_reference?: string;
      created_at: string;
      updated_at: string;
      tutoring_request_id?: string;
      session_type?: string;
      session_status?: string;
      subject?: string;
      payer_id?: string;
      payer_username?: string;
      payer_full_name?: string;
      recipient_id?: string;
      recipient_username?: string;
      recipient_full_name?: string;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> => {
    const response = await apiClient.get(
      "/admin/tutoring-business/transactions",
      { params }
    );
    return response.data.data;
  },

  getTutoringBusinessPendingPayouts: async (params: {
    space_id?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    payouts: Array<{
      tutor_id: string;
      applicant_id: string;
      username: string;
      full_name: string;
      avatar?: string;
      email: string;
      subject: string;
      account_type?: string;
      account_number?: string;
      account_name?: string;
      mobile_money_network?: string;
      pending_sessions: number;
      pending_amount: string;
      oldest_request_date?: string;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> => {
    const response = await apiClient.get(
      "/admin/tutoring-business/payouts/pending",
      { params }
    );
    return response.data.data;
  },

  getTutoringBusinessPayoutHistory: async (params: {
    space_id?: string;
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    payouts: Array<{
      id: string;
      amount: string;
      currency: string;
      status: string;
      payment_method?: string;
      payment_provider?: string;
      provider_reference?: string;
      created_at: string;
      updated_at: string;
      tutor_id: string;
      tutor_username: string;
      tutor_full_name: string;
      tutor_avatar?: string;
      sessions_count: number;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> => {
    const response = await apiClient.get(
      "/admin/tutoring-business/payouts/history",
      { params }
    );
    return response.data.data;
  },

  processTutoringBusinessPayout: async (data: {
    tutor_id: string;
    applicant_id: string;
    payment_method: string;
  }): Promise<{
    transaction_id: string;
    amount: string;
    status: string;
    sessions_count: number;
  }> => {
    const response = await apiClient.post(
      "/admin/tutoring-business/payouts/process",
      data
    );
    return response.data.data;
  },

  getTutoringBusinessDisputes: async (params: {
    space_id?: string;
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    disputes: Array<{
      id: string;
      session_type: string;
      session_status?: string;
      payment_status?: string;
      refund_request: boolean;
      refund_request_at?: string;
      refund_by?: string;
      cancel_reason?: string;
      requested_at: string;
      refunded_at?: string;
      tutor_id: string;
      subject: string;
      session_rate: string;
      semester_rate: string;
      tutor_user_id: string;
      tutor_username: string;
      tutor_full_name: string;
      tutor_avatar?: string;
      student_id: string;
      student_username: string;
      student_full_name: string;
      student_avatar?: string;
      transaction_id?: string;
      transaction_amount?: string;
      provider_reference?: string;
      transaction_status?: string;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> => {
    const response = await apiClient.get(
      "/admin/tutoring-business/disputes",
      { params }
    );
    return response.data.data;
  },

  approveTutoringBusinessRefund: async (requestId: string): Promise<void> => {
    await apiClient.post(
      `/admin/tutoring-business/disputes/${requestId}/approve-refund`
    );
  },

  getTutoringBusinessAnalytics: async (params: {
    space_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{
    pending_requests: number;
    accepted_requests: number;
    ongoing_sessions: number;
    completed_sessions: number;
    cancelled_sessions: number;
    single_sessions: number;
    semester_sessions: number;
    paid_sessions: number;
    refunded_sessions: number;
    refund_rate: number;
    total_revenue: string;
    active_tutors: number;
    pending_tutors: number;
    total_students: number;
    returning_students: number;
  }> => {
    const response = await apiClient.get(
      "/admin/tutoring-business/analytics",
      { params }
    );
    return response.data.data;
  },

  getTutoringBusinessRevenueBySubject: async (
    spaceId?: string
  ): Promise<
    Array<{
      subject: string;
      sessions_count: number;
      total_revenue: string;
    }>
  > => {
    const response = await apiClient.get(
      "/admin/tutoring-business/analytics/revenue-by-subject"
    );
    return response.data.data;
  },

  getTutoringBusinessSessionsByDate: async (
    spaceId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{
      date: string;
      session_count: number;
      completed_count: number;
    }>
  > => {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await apiClient.get(
      "/admin/tutoring-business/analytics/sessions-by-date",
      { params }
    );
    return response.data.data;
  },

  getActiveUsersGrowth: async (period: string = "month"): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/active-users", {
      params: { period },
    });
    return response.data.data;
  },

  getUsersByDepartment: async (): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/users-by-department");
    return response.data.data;
  },

  getUsersByLevel: async (): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/users-by-level");
    return response.data.data;
  },

  getSuspendedUsersGrowth: async (period: string = "month"): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/suspended-users", {
      params: { period },
    });
    return response.data.data;
  },

  getTutoringCompletedGrowth: async (period: string = "month"): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/tutoring-completed", {
      params: { period },
    });
    return response.data.data;
  },

  getTutoringOngoingGrowth: async (period: string = "month"): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/tutoring-ongoing", {
      params: { period },
    });
    return response.data.data;
  },

  getTutoringRefundRequestedGrowth: async (period: string = "month"): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/tutoring-refund-requested", {
      params: { period },
    });
    return response.data.data;
  },

  getTutoringPendingGrowth: async (period: string = "month"): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/tutoring-pending", {
      params: { period },
    });
    return response.data.data;
  },

  getPublicPostsGrowth: async (period: string = "month"): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/public-posts", {
      params: { period },
    });
    return response.data.data;
  },

  getHelpRequestsGrowth: async (period: string = "month"): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/help-requests", {
      params: { period },
    });
    return response.data.data;
  },

  getGroupsGrowth: async (period: string = "month"): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/groups", {
      params: { period },
    });
    return response.data.data;
  },

  getCommunitiesGrowth: async (period: string = "month"): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/communities", {
      params: { period },
    });
    return response.data.data;
  },

  getEventsGrowth: async (period: string = "month"): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/events", {
      params: { period },
    });
    return response.data.data;
  },

  getStoriesGrowth: async (period: string = "month"): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/stories", {
      params: { period },
    });
    return response.data.data;
  },

  getUsersByGroupType: async (): Promise<any[]> => {
    const response = await apiClient.get("/analytics/charts/users-by-group-type");
    return response.data.data;
  },

  getAllFeedback: async (
    status?: string,
    category?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ feedback: any[]; total: number; page: number; limit: number }> => {
    const params: any = { page, limit };
    if (status && status !== "all") params.status = status;
    if (category && category !== "all") params.category = category;
    const response = await apiClient.get("/feedback", { params });
    return response.data.data;
  },

  getFeedbackStats: async (): Promise<any> => {
    const response = await apiClient.get("/feedback/stats");
    return response.data.data;
  },

  updateFeedbackStatus: async (
    feedbackId: string,
    status: string
  ): Promise<void> => {
    await apiClient.put(`/feedback/${feedbackId}/status`, { status });
  },

  deleteFeedback: async (feedbackId: string): Promise<void> => {
    await apiClient.delete(`/feedback/${feedbackId}`);
  },

  createDepartment: async (data: {
    space_id: string;
    name: string;
    description?: string;
    head_of_department?: string;
    contact_email?: string;
  }): Promise<any> => {
    const response = await apiClient.post("/departments", data);
    return response.data.data;
  },

  bulkCreateDepartments: async (data: {
    space_id: string;
    departments: {
      name: string;
      description?: string;
      head_of_department?: string;
      contact_email?: string;
    }[];
  }): Promise<any> => {
    const response = await apiClient.post("/departments/bulk", data);
    return response.data.data;
  },
};
