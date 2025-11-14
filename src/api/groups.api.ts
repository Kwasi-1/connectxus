
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
  category: string;                  group_type: 'project' | 'study' | 'social';    avatar?: string | null;
  banner?: string | null;            allow_invites: boolean;
  allow_member_posts: boolean;
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
  space_id: string;
  community_id?: string | null;
  name: string;
  description?: string | null;
  category: string;                  group_type: 'project' | 'study' | 'social';    avatar?: string | null;
  banner?: string | null;            allow_invites?: boolean;
  allow_member_posts?: boolean;
  tags?: string[];
  settings?: any | null;
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
  message?: string | null;           status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at?: string | null;
    user?: any;                        role?: ProjectRole;              }

export interface ListGroupsParams extends PaginationParams {
  space_id?: string;                 community_id?: string;
  group_type?: 'project' | 'study' | 'social';
  category?: string;
  sort?: 'recent' | 'popular';
}

export const getGroups = async (params?: Omit<ListGroupsParams, 'space_id'>): Promise<Group[]> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.get<ApiResponse<Group[]>>('/groups', {
    params: { space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const getGroupById = async (groupId: string): Promise<Group> => {
  const response = await apiClient.get<ApiResponse<Group>>(`/groups/${groupId}`);
  return response.data.data;
};

export const createGroup = async (data: Omit<CreateGroupRequest, 'space_id'>): Promise<Group> => {
  const spaceId = getValidatedSpaceId();

  const requestData: CreateGroupRequest = {
    ...data,
    space_id: spaceId,
  };

  const response = await apiClient.post<ApiResponse<Group>>('/groups', requestData);
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
): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
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
  status: 'accepted' | 'rejected'
): Promise<RoleApplication> => {
  const response = await apiClient.put<ApiResponse<RoleApplication>>(
    `/applications/${applicationId}/status`,
    { status }
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
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.get<ApiResponse<Group[]>>('/users/groups', {
    params: { space_id: spaceId, ...params },
  });
  return response.data.data;
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
};

export default groupsApi;
