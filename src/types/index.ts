export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  age: number;
  sport: string;
  role: 'user' | 'admin' | 'scouter';
  language: string;
  uniqueId: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Test {
  id: string;
  name: string;
  description: string;
  category: 'fitness' | 'skill' | 'endurance' | 'strength';
  duration: number; // in seconds
  instructions: string[];
  requirements: string[];
  icon: string;
}

export interface TestResult {
  id: string;
  userId: string;
  testId: string;
  score: number;
  metrics: Record<string, any>;
  videoUrl: string;
  aiConfidence: number;
  timestamp: Date;
  isValid: boolean;
  feedback: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  score: number;
  rank: number;
  testId: string;
  testName: string;
  location: string;
  timestamp: Date;
}

export interface EventItem {
  id: string;
  title: string;
  date: Date;
  location: string;
  type: 'Competition' | 'Assessment' | 'Camp' | 'Other';
  description?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface AppState {
  auth: AuthState;
  selectedLanguage: string;
  theme: 'light' | 'dark';
  events?: EventItem[];
}

export type RootStackParamList = {
  LanguageSelection: undefined;
  Auth: undefined;
  Onboarding: undefined;
  UserPortal: undefined;
  AdminPortal: undefined;
  CameraTest: { testId: string };
  TestReport: { testId: string };
  EventDetail: { eventId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  GovLogin: undefined;
  GovSignup: undefined;
};

export type UserStackParamList = {
  UserDashboard: undefined;
  TestSelection: undefined;
  CameraTest: { testId: string };
  Leaderboard: undefined;
  Profile: undefined;
  TestHistory: undefined;
  TestReport: { testId: string };
  EventDetail: { eventId: string };
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  UserManagement: undefined;
  TestManagement: undefined;
  Analytics: undefined;
  Settings: undefined;
  CreateEvent: undefined;
  AdminLeaderboard: undefined;
};