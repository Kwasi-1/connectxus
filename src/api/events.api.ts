
import apiClient, { getValidatedSpaceId } from '@/lib/apiClient';

interface ApiResponse<T> {
  data: T;
}

export interface PaginationParams {
  page?: number;        limit?: number;     }

export interface Event {
  id: string;
  space_id: string;
  title: string;
  description?: string | null;
  category: string;                  location?: string | null;
  venue_details?: string | null;
  start_date: string;                end_date: string;                  timezone?: string | null;
  tags?: string[];
  image_url?: string | null;         max_attendees?: number | null;     registered_count: number;          registration_required: boolean;
  registration_deadline?: string | null;    is_public: boolean;
  organizer_id: string;
  created_at: string;
  updated_at?: string | null;
    is_registered?: boolean;
  organizer?: any;                 }

export interface CreateEventRequest {
  space_id: string;
  title: string;
  description?: string | null;
  category: string;                  location?: string | null;
  venue_details?: string | null;
  start_date: string;                end_date: string;                  timezone?: string | null;
  tags?: string[];
  image_url?: string | null;         max_attendees?: number | null;     registration_required?: boolean;
  registration_deadline?: string | null;    is_public?: boolean;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string | null;
  category?: string;
  location?: string | null;
  venue_details?: string | null;
  start_date?: string;               end_date?: string;                 timezone?: string | null;
  tags?: string[];
  image_url?: string | null;         max_attendees?: number | null;
  registration_required?: boolean;
  registration_deadline?: string | null;
  is_public?: boolean;
}

export interface ListEventsParams extends PaginationParams {
  space_id?: string;                 category?: string;
  sort?: 'upcoming' | 'recent' | 'popular';
}

export const getEvents = async (params?: Omit<ListEventsParams, 'space_id'>): Promise<Event[]> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.get<ApiResponse<Event[]>>('/events', {
    params: { space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const getEventById = async (eventId: string): Promise<Event> => {
  const response = await apiClient.get<ApiResponse<Event>>(`/events/${eventId}`);
  return response.data.data;
};

export const getUpcomingEvents = async (params?: PaginationParams): Promise<Event[]> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.get<ApiResponse<Event[]>>('/events/upcoming', {
    params: { space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const searchEvents = async (query: string, params?: PaginationParams): Promise<Event[]> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.get<ApiResponse<Event[]>>('/events/search', {
    params: { q: query, space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const getEventCategories = async (): Promise<string[]> => {
  const response = await apiClient.get<ApiResponse<string[]>>('/events/categories');
  return response.data.data;
};

export const createEvent = async (data: Omit<CreateEventRequest, 'space_id'>): Promise<Event> => {
  const spaceId = getValidatedSpaceId();

  const requestData: CreateEventRequest = {
    ...data,
    space_id: spaceId,
  };

  const response = await apiClient.post<ApiResponse<Event>>('/events', requestData);
  return response.data.data;
};

export const updateEvent = async (
  eventId: string,
  data: UpdateEventRequest
): Promise<Event> => {
  const response = await apiClient.put<ApiResponse<Event>>(`/events/${eventId}`, data);
  return response.data.data;
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  await apiClient.delete(`/events/${eventId}`);
};

export const registerForEvent = async (eventId: string): Promise<void> => {
  await apiClient.post(`/events/${eventId}/register`);
};

export const unregisterFromEvent = async (eventId: string): Promise<void> => {
  await apiClient.delete(`/events/${eventId}/register`);
};

export const getEventAttendees = async (
  eventId: string,
  params?: PaginationParams
): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/events/${eventId}/attendees`,
    { params }
  );
  return response.data.data;
};

export const getEventCoOrganizers = async (eventId: string): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(`/events/${eventId}/co-organizers`);
  return response.data.data;
};

export const addEventCoOrganizer = async (eventId: string, userId: string): Promise<void> => {
  await apiClient.post(`/events/${eventId}/co-organizers`, { user_id: userId });
};

export const removeEventCoOrganizer = async (eventId: string, userId: string): Promise<void> => {
  await apiClient.delete(`/events/${eventId}/co-organizers/${userId}`);
};

export const markAttendance = async (
  eventId: string,
  userId: string,
  attended: boolean
): Promise<void> => {
  await apiClient.post(`/events/${eventId}/attendance/${userId}`, { attended });
};

export const getUserEvents = async (params?: PaginationParams): Promise<Event[]> => {
  const spaceId = getValidatedSpaceId();
  const response = await apiClient.get<ApiResponse<Event[]>>('/users/events', {
    params: { space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const getTrendingEvents = async (params?: PaginationParams): Promise<Event[]> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.get<ApiResponse<Event[]>>('/events/trending', {
    params: { space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const getPublicEvents = async (params?: PaginationParams): Promise<Event[]> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.get<ApiResponse<Event[]>>('/events', {
    params: { space_id: spaceId, ...params },
  });

  const events = response.data.data;
  const now = new Date();

    return events.filter(event => {
        if (!event.is_public) return false;

        const endDate = new Date(event.end_date);
    if (endDate < now) return false; 
        if (event.registration_required && event.registration_deadline) {
      const deadline = new Date(event.registration_deadline);
      if (deadline < now) return false;     }

    return true;
  });
};

export const eventsApi = {
  getEvents,
  getEventById,
  getUpcomingEvents,
  searchEvents,
  getEventCategories,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventAttendees,
  getEventCoOrganizers,
  addEventCoOrganizer,
  removeEventCoOrganizer,
  markAttendance,
  getUserEvents,
  getTrendingEvents,
  getPublicEvents,
};

export default eventsApi;
