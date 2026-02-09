export interface HelpRequest {
  id: string;
  owner_id: string;
  space_id: string;
  department_id?: string;
  title: string;
  description: string;
  subject?: string;
  type: 'course' | 'project' | 'general';
  deadline: string;
  status: 'public' | 'private';
  owner_name?: string;
  owner_username?: string;
  owner_avatar?: string;
  owner_level?: string;
  department_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHelpRequestRequest {
  title: string;
  description: string;
  subject?: string;
  type: 'course' | 'project' | 'general';
  deadline: string;
  status?: 'public' | 'private';
  department_id?: string;
}

export interface UpdateHelpRequestRequest {
  title?: string;
  description?: string;
  subject?: string;
  type?: 'course' | 'project' | 'general';
  deadline?: string;
  status?: 'public' | 'private';
}

export interface HelpRequestsResponse {
  help_requests: HelpRequest[];
  total: number;
}
