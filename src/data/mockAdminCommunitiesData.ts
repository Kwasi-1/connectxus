import { Community, Group } from "@/types/communities";
import { User } from "@/types/global";

// Admin Group interface for admin management
export interface AdminGroup extends Group {
  status: "active" | "inactive" | "suspended";
  flags: number;
  lastActivity: Date;
  creatorInfo: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

// Mock API - replace with real API calls
export const mockCommunitiesApi = {
  getCommunities: async (): Promise<Community[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: "1",
        name: "Computer Science Department",
        description:
          "Connect with fellow CS students, share projects, and collaborate on assignments.",
        category: "Academic",
        memberCount: 1247,
        coverImage: "/placeholder.svg",
        isJoined: false,
        createdAt: new Date("2024-01-15"),
        admins: ["admin-1"],
        moderators: ["mod-1", "mod-2"],
      },
      {
        id: "2",
        name: "Engineering Faculty",
        description:
          "All engineering students unite! Share resources, study materials, and project ideas.",
        category: "Academic",
        memberCount: 3456,
        coverImage: "/placeholder.svg",
        isJoined: false,
        createdAt: new Date("2024-02-01"),
        admins: ["admin-2"],
        moderators: ["mod-3"],
      },
      {
        id: "3",
        name: "Level 200 Students",
        description:
          "Second-year students community for academic support and social connections.",
        category: "Level",
        memberCount: 892,
        coverImage: "/placeholder.svg",
        isJoined: false,
        createdAt: new Date("2024-01-20"),
        admins: ["admin-3"],
        moderators: ["mod-4", "mod-5"],
      },
      {
        id: "4",
        name: "Volta Hall Community",
        description:
          "Students residing in Volta Hall. Share hall updates and connect with hall mates.",
        category: "Hostel",
        memberCount: 234,
        coverImage: "/placeholder.svg",
        isJoined: false,
        createdAt: new Date("2024-01-10"),
        admins: ["admin-4"],
        moderators: [],
      },
      {
        id: "5",
        name: "Business School",
        description: "Future business leaders network and share opportunities.",
        category: "Academic",
        memberCount: 678,
        coverImage: "/placeholder.svg",
        isJoined: false,
        createdAt: new Date("2024-02-10"),
        admins: ["admin-5"],
        moderators: ["mod-6"],
      },
    ];
  },
  createCommunity: async (
    community: Partial<Community>
  ): Promise<Community> => {
    // Mock implementation
    return { ...community, id: Date.now().toString() } as Community;
  },
  updateCommunity: async (
    id: string,
    community: Partial<Community>
  ): Promise<Community> => {
    // Mock implementation
    return community as Community;
  },
  deleteCommunity: async (id: string): Promise<void> => {
    // Mock implementation
  },
  assignModerator: async (
    communityId: string,
    userId: string
  ): Promise<void> => {
    // Mock implementation
  },
  exportCommunities: async (): Promise<void> => {
    // Mock implementation
  },
};

// Mock Groups API
export const mockGroupsApi = {
  getGroups: async (): Promise<AdminGroup[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: "g1",
        name: "Study Squad - Data Structures",
        description:
          "Weekly study sessions for Data Structures and Algorithms course.",
        category: "Study Group",
        memberCount: 23,
        groupType: "public",
        isJoined: false,
        tags: ["Study", "CS", "Algorithms"],
        createdAt: new Date("2024-03-01"),
        createdBy: "user-1",
        avatar: "/placeholder.svg",
        admins: ["user-1"],
        moderators: ["user-2"],
        status: "active",
        flags: 0,
        lastActivity: new Date("2024-03-15"),
        creatorInfo: {
          id: "user-1",
          name: "John Doe",
          email: "john@university.edu",
          avatar: "/placeholder.svg",
        },
      },
      {
        id: "g2",
        name: "AI Research Group",
        description:
          "Collaborative research on machine learning and artificial intelligence.",
        category: "Academic",
        memberCount: 15,
        groupType: "private",
        isJoined: false,
        tags: ["AI", "Research", "Machine Learning"],
        createdAt: new Date("2024-02-15"),
        createdBy: "user-3",
        avatar: "/placeholder.svg",
        admins: ["user-3"],
        moderators: [],
        status: "active",
        flags: 0,
        lastActivity: new Date("2024-03-14"),
        creatorInfo: {
          id: "user-3",
          name: "Dr. Sarah Wilson",
          email: "sarah.wilson@university.edu",
          avatar: "/placeholder.svg",
        },
      },
      {
        id: "g3",
        name: "Campus Mobile App Project",
        description: "Building a comprehensive mobile app for campus services.",
        category: "Professional",
        memberCount: 8,
        groupType: "project",
        isJoined: false,
        tags: ["Mobile Dev", "React Native", "Team Project"],
        createdAt: new Date("2024-01-20"),
        createdBy: "user-4",
        avatar: "/placeholder.svg",
        admins: ["user-4"],
        moderators: ["user-5"],
        projectRoles: [
          {
            id: "role-1",
            name: "Frontend Developer",
            description: "React Native mobile app development",
            slotsTotal: 2,
            slotsFilled: 1,
            applications: [],
          },
          {
            id: "role-2",
            name: "Backend Developer",
            description: "Node.js API development",
            slotsTotal: 2,
            slotsFilled: 2,
            applications: [],
          },
        ],
        projectDeadline: new Date("2024-12-01"),
        isAcceptingApplications: true,
        status: "active",
        flags: 0,
        lastActivity: new Date("2024-03-13"),
        creatorInfo: {
          id: "user-4",
          name: "Mike Chen",
          email: "mike.chen@university.edu",
          avatar: "/placeholder.svg",
        },
      },
      {
        id: "g4",
        name: "Gaming Club",
        description: "Weekly gaming sessions and esports tournaments.",
        category: "Social",
        memberCount: 45,
        groupType: "public",
        isJoined: false,
        tags: ["Gaming", "Esports", "Social"],
        createdAt: new Date("2024-02-28"),
        createdBy: "user-6",
        avatar: "/placeholder.svg",
        admins: ["user-6"],
        moderators: ["user-7"],
        status: "inactive",
        flags: 2,
        lastActivity: new Date("2024-02-28"),
        creatorInfo: {
          id: "user-6",
          name: "Alex Turner",
          email: "alex.turner@university.edu",
        },
      },
      {
        id: "g5",
        name: "Photography Society",
        description: "Capture campus life and improve photography skills together.",
        category: "Arts",
        memberCount: 89,
        groupType: "public",
        isJoined: false,
        tags: ["Photography", "Art", "Creative"],
        createdAt: new Date("2024-02-20"),
        createdBy: "user-8",
        avatar: "/placeholder.svg",
        admins: ["user-8"],
        moderators: ["user-9"],
        status: "active",
        flags: 1,
        lastActivity: new Date("2024-03-12"),
        creatorInfo: {
          id: "user-8",
          name: "Lisa Wang",
          email: "lisa.wang@university.edu",
          avatar: "/placeholder.svg",
        },
      },
      {
        id: "g6",
        name: "Suspended Test Group",
        description: "This group has been suspended for policy violations.",
        category: "Social",
        memberCount: 12,
        groupType: "public",
        isJoined: false,
        tags: ["Test", "Suspended"],
        createdAt: new Date("2024-01-15"),
        createdBy: "user-10",
        avatar: "/placeholder.svg",
        admins: ["user-10"],
        moderators: [],
        status: "suspended",
        flags: 5,
        lastActivity: new Date("2024-01-20"),
        creatorInfo: {
          id: "user-10",
          name: "Test User",
          email: "test@university.edu",
        },
      },
    ];
  },
  suspendGroup: async (groupId: string): Promise<void> => {
    // Mock implementation
    console.log(`Suspending group ${groupId}`);
  },
  reactivateGroup: async (groupId: string): Promise<void> => {
    // Mock implementation
    console.log(`Reactivating group ${groupId}`);
  },
  exportGroups: async (): Promise<void> => {
    // Mock implementation
    console.log("Exporting groups data");
  },
};

export const mockUsersApi = {
  searchUsers: async (query: string): Promise<User[]> => {
    // Mock implementation - replace with real API
    return [
      {
        id: "user-1",
        username: "john_doe",
        displayName: "John Doe",
        email: "john@university.edu",
        avatar: "/placeholder.svg",
        verified: false,
        followers: 234,
        following: 180,
        createdAt: new Date("2024-01-01"),
        roles: ["student" as const],
      },
      {
        id: "user-2",
        username: "sarah_admin",
        displayName: "Sarah Johnson",
        email: "sarah@university.edu",
        avatar: "/placeholder.svg",
        verified: true,
        followers: 456,
        following: 234,
        createdAt: new Date("2024-01-02"),
        roles: ["admin" as const],
      },
      {
        id: "user-3",
        username: "mike_mod",
        displayName: "Mike Wilson",
        email: "mike@university.edu",
        avatar: "/placeholder.svg",
        verified: true,
        followers: 789,
        following: 345,
        createdAt: new Date("2024-01-03"),
        roles: ["ta" as const],
      },
    ];
  },
};