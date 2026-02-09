export type ApprovalStatus = "pending" | "approved" | "rejected";

export type UserInterest =
  | "technology"
  | "design"
  | "business"
  | "marketing"
  | "finance"
  | "healthcare"
  | "education"
  | "research"
  | "engineering"
  | "arts"
  | "sports"
  | "music"
  | "photography"
  | "writing"
  | "gaming"
  | "travel"
  | "cooking"
  | "fitness";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  university?: string;
  department?: string;
  level?: string;
  interests?: UserInterest[];
  createdAt: Date;
}

export interface SignUpFormData {
  role: "student" | "not-student";
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  space_id: string;
  department_id?: string;
  department_id_2?: string;
  department_id_3?: string;
  level?: string;
  interests?: UserInterest[];
  phoneNumber: string;
  is_student: boolean;
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
  setAuthUser: (user: any, isNewUser?: boolean) => void;
}
