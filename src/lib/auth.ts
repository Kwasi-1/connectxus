
import { AuthUser, SignInFormData, SignUpFormData, UserRole } from '@/types/auth';

const MOCK_USERS: AuthUser[] = [
  {
    id: '1',
    email: 'student@university.edu',
    name: 'John Student',
    roles: ['student'],
    university: 'University of Technology',
    department: 'Computer Science',
    level: '300',
    interests: ['technology', 'gaming', 'music'],
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'tutor@university.edu',
    name: 'Jane Tutor',
    roles: ['student', 'tutor'],
    university: 'University of Technology',
    department: 'Mathematics',
    level: '400',
    interests: ['education', 'research', 'fitness'],
    tutorStatus: 'approved',
    createdAt: new Date(),
  },
];

export const signIn = async (data: SignInFormData): Promise<AuthUser> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = MOCK_USERS.find(u => u.email === data.email);
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
    if (data.password !== 'password123') {
    throw new Error('Invalid email or password');
  }
  
  return user;
};

export const signUp = async (data: SignUpFormData): Promise<AuthUser> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    const existingUser = MOCK_USERS.find(u => u.email === data.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
    const roles: UserRole[] = [data.role];
  if (data.role === 'student') {
    if (data.wantsToBeTutor) roles.push('tutor');
    if (data.wantsToBeMapMentor) roles.push('mentor');
  } else if (data.role === 'ta') {
    roles.push('tutor');
  } else if (data.role === 'lecturer') {
    roles.push('mentor');
  }
  
  const newUser: AuthUser = {
    id: Date.now().toString(),
    email: data.email,
    name: data.name,
    roles,
    university: data.university,
    department: data.department,
    level: data.level,
    interests: data.interests || [],
    mentorStatus: roles.includes('mentor') ? 'pending' : undefined,
    tutorStatus: roles.includes('tutor') ? 'approved' : undefined,
    createdAt: new Date(),
  };
  
    MOCK_USERS.push(newUser);
  
  return newUser;
};

export const signOut = async (): Promise<void> => {
    localStorage.removeItem('auth-user');
};
