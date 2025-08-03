
export type UserRole = 'student' | 'tutor' | 'mentor' | 'ta' | 'lecturer' | 'admin';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  university?: string;
  department?: string;
  level?: string;
  mentorStatus?: ApprovalStatus;
  tutorStatus?: ApprovalStatus;
  createdAt: Date;
}

export interface SignUpFormData {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  university?: string;
  department?: string;
  level?: string;
  wantsToBeTutor?: boolean;
  wantsToBeMapMentor?: boolean;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (data: SignInFormData) => Promise<void>;
  signUp: (data: SignUpFormData) => Promise<void>;
  signOut: () => void;
}
