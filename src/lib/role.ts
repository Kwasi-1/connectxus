
import { AuthUser, UserRole } from '@/types/auth';

export const hasRole = (user: AuthUser | null, role: UserRole): boolean => {
  if (!user) return false;
  return user.roles.includes(role);
};

export const hasAnyRole = (user: AuthUser | null, roles: UserRole[]): boolean => {
  if (!user) return false;
  return roles.some(role => user.roles.includes(role));
};

export const isApproved = (user: AuthUser | null, role: 'tutor' | 'mentor'): boolean => {
  if (!user) return false;
  
  if (role === 'tutor' && hasRole(user, 'tutor')) {
    return user.tutorStatus === 'approved';
  }
  
  if (role === 'mentor' && hasRole(user, 'mentor')) {
    return user.mentorStatus === 'approved';
  }
  
  return false;
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    student: 'Student',
    tutor: 'Tutor',
    mentor: 'Mentor',
    ta: 'Teaching Assistant',
    lecturer: 'Lecturer',
    admin: 'Administrator',
  };
  
  return roleNames[role];
};
