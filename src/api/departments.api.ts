
import apiClient from '@/lib/apiClient';

interface ApiResponse<T> {
  data: T;
}

export interface Department {
  id: string;
  space_id: string;
  code: string;
  name: string;
  description?: string | null;
  head_of_department?: string | null;
  contact_email?: string | null;
  status: string;
}

export const getDepartmentsBySpace = async (spaceId: string): Promise<Department[]> => {
  const response = await apiClient.get<ApiResponse<{ departments: Department[] }>>(
    `/spaces/${spaceId}/departments`
  );
  return response.data.data.departments;
};

export const getDepartmentById = async (departmentId: string): Promise<Department> => {
  const response = await apiClient.get<ApiResponse<Department>>(`/departments/${departmentId}`);
  return response.data.data;
};

export const searchDepartments = async (
  spaceId: string,
  query: string
): Promise<Department[]> => {
  const response = await apiClient.get<ApiResponse<{ departments: Department[] }>>(
    `/spaces/${spaceId}/departments/search`,
    { params: { q: query } }
  );
  return response.data.data.departments;
};

export const departmentsApi = {
  getDepartmentsBySpace,
  getDepartmentById,
  searchDepartments,
};

export default departmentsApi;
