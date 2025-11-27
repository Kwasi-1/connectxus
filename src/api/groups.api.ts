
import apiClient, { getValidatedSpaceId } from '@/lib/apiClient';

interface ApiResponse<T> {
  data: T;
}

export interface PaginationParams {
  page?: number;        limit?: number;     }

export interface Group {
  id: string;
  space_id: string;
  community_id?: string | null;
  name: string;
  description?: string | null;
  category: string;                  group_type: 'project' | 'public' | 'private';    avatar?: string | null;
  banner?: string | null;            allow_invites: boolean;
  allow_member_posts: boolean;
  created_by?: string | null;
  tags?: string[];
  settings?: any | null;             member_count: number;
  created_at: string;
  updated_at?: string | null;
    is_member?: boolean;
  role?: string | null;            }

export interface ProjectRole {
  id: string;
  group_id: string;
  name: string;                      description?: string | null;
  slots_total: number;               slots_filled: number;              requirements?: string | null;
  skills_required?: string[];        created_at: string;
  updated_at?: string | null;
}

export interface CreateGroupRequest {
  community_id?: string | null;
  name: string;
  description?: string | null;
  category: string;
  group_type: 'project' | 'study' | 'social';
  avatar?: string | null;
  banner?: string | null;
  allow_invites?: boolean;
  allow_member_posts?: boolean;
  tags?: string[];
  settings?: any | null;
  roles?: CreateRoleRequest[];
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string | null;
  category?: string;
  group_type?: 'project' | 'study' | 'social';
  avatar?: string | null;
  banner?: string | null;
  allow_invites?: boolean;
  allow_member_posts?: boolean;
  tags?: string[];
  settings?: any | null;
}

export interface CreateRoleRequest {
  name: string;                      description?: string | null;
  slots_total: number;               requirements?: string | null;
  skills_required?: string[];      }

export interface RoleApplication {
  id: string;
  role_id: string;
  user_id: string;
  message?: string | null;
  status: string;
  applied_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_notes?: string | null;
  username: string;
  full_name: string;
  avatar?: string | null;
  role_name: string;
}

export interface GroupMember {
  id: string;
  username: string;
  full_name: string;
  avatar?: string | null;
  level?: string | null;
  department?: string | null;
  verified: boolean;
  role: string;
  joined_at?: string | null;
  permissions: string[];
}

export interface ListGroupsParams extends PaginationParams {
  space_id?: string;                 community_id?: string;
  group_type?: 'project' | 'study' | 'social';
  category?: string;
  sort?: 'recent' | 'popular';
}

export const getGroups = async (params?: Omit<ListGroupsParams, 'space_id'>): Promise<Group[]> => {
    let spaceId: string | undefined;
  try {
    spaceId = getValidatedSpaceId();
  } catch (error) {
        spaceId = undefined;
  }

  const response = await apiClient.get<ApiResponse<Group[]>>('/groups', {
    params: spaceId ? { space_id: spaceId, ...params } : params,
  });
  return response.data.data;
};

export const getGroupById = async (groupId: string): Promise<Group> => {
  const response = await apiClient.get<ApiResponse<Group>>(`/groups/${groupId}`);
  return response.data.data;
};

export const createGroup = async (data: CreateGroupRequest): Promise<Group> => {
  const response = await apiClient.post<ApiResponse<Group>>('/groups', data);
  return response.data.data;
};

export const updateGroup = async (
  groupId: string,
  data: UpdateGroupRequest
): Promise<Group> => {
  const response = await apiClient.put<ApiResponse<Group>>(`/groups/${groupId}`, data);
  return response.data.data;
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  await apiClient.delete(`/groups/${groupId}`);
};

export const searchGroups = async (
  query: string,
  params?: PaginationParams
): Promise<Group[]> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.get<ApiResponse<Group[]>>('/groups/search', {
    params: { q: query, space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const joinGroup = async (groupId: string): Promise<void> => {
  await apiClient.post(`/groups/${groupId}/join`);
};

export const leaveGroup = async (groupId: string): Promise<void> => {
  await apiClient.post(`/groups/${groupId}/leave`);
};

export const getGroupJoinRequests = async (groupId: string): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(`/groups/${groupId}/join-requests`);
  return response.data.data;
};

export const getGroupMembers = async (
  groupId: string,
  params?: PaginationParams
): Promise<GroupMember[]> => {
  const response = await apiClient.get<ApiResponse<GroupMember[]>>(
    `/groups/${groupId}/members`,
    { params }
  );
  return response.data.data;
};

export const getGroupRoles = async (groupId: string): Promise<ProjectRole[]> => {
  const response = await apiClient.get<ApiResponse<ProjectRole[]>>(`/groups/${groupId}/roles`);
  return response.data.data;
};

export const createProjectRole = async (
  groupId: string,
  data: CreateRoleRequest
): Promise<ProjectRole> => {
  const response = await apiClient.post<ApiResponse<ProjectRole>>(
    `/groups/${groupId}/roles`,
    data
  );
  return response.data.data;
};

export const updateProjectRole = async (
  roleId: string,
  data: Partial<CreateRoleRequest>
): Promise<ProjectRole> => {
  const response = await apiClient.put<ApiResponse<ProjectRole>>(`/roles/${roleId}`, data);
  return response.data.data;
};

export const deleteProjectRole = async (roleId: string): Promise<void> => {
  await apiClient.delete(`/roles/${roleId}`);
};

export const applyForRole = async (
  roleId: string,
  data: { message?: string | null }
): Promise<RoleApplication> => {
  const response = await apiClient.post<ApiResponse<RoleApplication>>(
    `/roles/${roleId}/apply`,
    data
  );
  return response.data.data;
};

export const getGroupApplications = async (groupId: string): Promise<RoleApplication[]> => {
  const response = await apiClient.get<ApiResponse<RoleApplication[]>>(
    `/groups/${groupId}/applications`
  );
  return response.data.data;
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: 'approved' | 'rejected',
  review_notes?: string
): Promise<RoleApplication> => {
  const response = await apiClient.put<ApiResponse<RoleApplication>>(
    `/applications/${applicationId}/status`,
    { status, review_notes }
  );
  return response.data.data;
};

export const addGroupAdmin = async (groupId: string, userId: string): Promise<void> => {
  await apiClient.post(`/groups/${groupId}/admins`, { user_id: userId });
};

export const removeGroupAdmin = async (groupId: string, userId: string): Promise<void> => {
  await apiClient.delete(`/groups/${groupId}/admins/${userId}`);
};

export const addGroupModerator = async (groupId: string, userId: string): Promise<void> => {
  await apiClient.post(`/groups/${groupId}/moderators`, { user_id: userId });
};

export const removeGroupModerator = async (groupId: string, userId: string): Promise<void> => {
  await apiClient.delete(`/groups/${groupId}/moderators/${userId}`);
};

export const updateMemberRole = async (
  groupId: string,
  userId: string,
  role: string
): Promise<void> => {
  await apiClient.put(`/groups/${groupId}/members/${userId}/role`, { role });
};

export const getUserGroups = async (params?: PaginationParams): Promise<Group[]> => {
    let spaceId: string | undefined;
  try {
    spaceId = getValidatedSpaceId();
  } catch (error) {
        spaceId = undefined;
  }

  const response = await apiClient.get<ApiResponse<Group[]>>('/users/groups', {
    params: spaceId ? { space_id: spaceId, ...params } : params,
  });
  return response.data.data;
};

export const getRecommendedGroups = async (params?: PaginationParams): Promise<Group[]> => {
    let spaceId: string | undefined;
  try {
    spaceId = getValidatedSpaceId();
  } catch (error) {
        spaceId = undefined;
  }

  const response = await apiClient.get<ApiResponse<Group[]>>('/users/groups/recommended', {
    params: spaceId ? { space_id: spaceId, ...params } : params,
  });
  return response.data.data;
};

export interface JoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  message?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_notes?: string | null;
  username: string;
  full_name: string;
  avatar?: string | null;
  level?: string | null;
  department?: string | null;
}

export const createJoinRequest = async (
  groupId: string,
  data: { message?: string }
): Promise<JoinRequest> => {
  const response = await apiClient.post<ApiResponse<JoinRequest>>(
    `/groups/${groupId}/join-requests`,
    data
  );
  return response.data.data;
};

export const getJoinRequests = async (groupId: string): Promise<JoinRequest[]> => {
  const response = await apiClient.get<ApiResponse<JoinRequest[]>>(
    `/groups/${groupId}/join-requests`
  );
  return response.data.data;
};

export const approveJoinRequest = async (
  requestId: string,
  review_notes?: string
): Promise<void> => {
  await apiClient.put(`/join-requests/${requestId}/approve`, { review_notes });
};

export const rejectJoinRequest = async (
  requestId: string,
  review_notes?: string
): Promise<void> => {
  await apiClient.put(`/join-requests/${requestId}/reject`, { review_notes });
};

export interface Announcement {
  id: string;
  group_id: string;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  status: string;
  created_at: string;
  updated_at?: string | null;
  author_username: string;
  author_full_name: string;
  author_avatar?: string | null;
}

export const createGroupAnnouncement = async (
  groupId: string,
  data: { title: string; content: string; is_pinned?: boolean }
): Promise<Announcement> => {
  const response = await apiClient.post<ApiResponse<Announcement>>(
    `/groups/${groupId}/announcements`,
    data
  );
  return response.data.data;
};

export const getGroupAnnouncements = async (
  groupId: string,
  params?: PaginationParams
): Promise<Announcement[]> => {
  const response = await apiClient.get<ApiResponse<Announcement[]>>(
    `/groups/${groupId}/announcements`,
    { params }
  );
  return response.data.data;
};

export const updateGroupAnnouncement = async (
  announcementId: string,
  data: { title: string; content: string; is_pinned?: boolean }
): Promise<Announcement> => {
  const response = await apiClient.put<ApiResponse<Announcement>>(
    `/group-announcements/${announcementId}`,
    data
  );
  return response.data.data;
};

export const deleteGroupAnnouncement = async (announcementId: string): Promise<void> => {
  await apiClient.delete(`/group-announcements/${announcementId}`);
};

export const pinGroupAnnouncement = async (
  announcementId: string,
  pinned: boolean
): Promise<void> => {
  await apiClient.put(`/group-announcements/${announcementId}/pin`, { pinned });
};

export const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
  await apiClient.delete(`/groups/${groupId}/members/${userId}`);
};

export const groupsApi = {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  searchGroups,
  joinGroup,
  leaveGroup,
  getGroupJoinRequests,
  getGroupMembers,
  getGroupRoles,
  createProjectRole,
  updateProjectRole,
  deleteProjectRole,
  applyForRole,
  getGroupApplications,
  updateApplicationStatus,
  addGroupAdmin,
  removeGroupAdmin,
  addGroupModerator,
  removeGroupModerator,
  updateMemberRole,
  getUserGroups,
  getRecommendedGroups,
  createJoinRequest,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  createGroupAnnouncement,
  getGroupAnnouncements,
  updateGroupAnnouncement,
  deleteGroupAnnouncement,
  pinGroupAnnouncement,
  removeGroupMember,
};

export interface GroupResource {
  id: string;
  group_id: string;
  uploaded_by: string;
  name: string;
  description?: string | null;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
  category?: string | null;
  tags: string[];
  download_count: number;
  status: string;
  created_at: string;
  updated_at?: string | null;
  uploader_username: string;
  uploader_full_name: string;
  uploader_avatar?: string | null;
}

export interface CreateResourceRequest {
  name: string;
  description?: string | null;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
  category?: string | null;
  tags?: string[];
}

export interface UpdateResourceRequest {
  name: string;
  description?: string | null;
  category?: string | null;
  tags?: string[];
}

export async function createGroupResource(
  groupId: string,
  resource: CreateResourceRequest
): Promise<GroupResource> {
  const response = await apiClient.post<ApiResponse<GroupResource>>(
    `/groups/${groupId}/resources`,
    resource
  );
  return response.data.data;
}

export async function getGroupResources(
  groupId: string,
  params?: PaginationParams
): Promise<GroupResource[]> {
  const response = await apiClient.get<ApiResponse<GroupResource[]>>(
    `/groups/${groupId}/resources`,
    { params: { ...params, space_id: getValidatedSpaceId() } }
  );
  return response.data.data;
}

export async function getResourceById(resourceId: string): Promise<GroupResource> {
  const response = await apiClient.get<ApiResponse<GroupResource>>(
    `/resources/${resourceId}`
  );
  return response.data.data;
}

export async function updateGroupResource(
  resourceId: string,
  resource: UpdateResourceRequest
): Promise<GroupResource> {
  const response = await apiClient.put<ApiResponse<GroupResource>>(
    `/resources/${resourceId}`,
    resource
  );
  return response.data.data;
}

export async function deleteGroupResource(resourceId: string): Promise<void> {
  await apiClient.delete(`/resources/${resourceId}`);
}

export async function downloadResource(resourceId: string): Promise<{
  file_url: string;
  download_count: number;
}> {
  const response = await apiClient.get<ApiResponse<{
    file_url: string;
    download_count: number;
  }>>(`/resources/${resourceId}/download`);
  return response.data.data;
}

export default groupsApi;
