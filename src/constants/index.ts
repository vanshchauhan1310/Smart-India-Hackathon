import { Language, Test } from '../types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

export const SPORTS = [
  'Football', 'Cricket', 'Basketball', 'Tennis', 'Badminton', 
  'Athletics', 'Swimming', 'Volleyball', 'Hockey', 'Boxing',
  'Wrestling', 'Gymnastics', 'Cycling', 'Table Tennis', 'Kabaddi'
];

export const TESTS: Test[] = [
  {
    id: '1',
    name: 'Vertical Jump',
    description: 'Measure your explosive leg power',
    category: 'fitness',
    duration: 30,
    instructions: [
      'Stand with feet shoulder-width apart',
      'Bend knees and jump as high as possible',
      'Land softly on both feet',
      'Repeat for 30 seconds'
    ],
    requirements: ['Clear space above', 'Good lighting', 'Camera at waist level'],
    icon: '🏃‍♂️'
  },
  {
    id: '2',
    name: 'Push-ups',
    description: 'Test your upper body strength',
    category: 'strength',
    duration: 60,
    instructions: [
      'Start in plank position',
      'Lower body until chest nearly touches ground',
      'Push back up to starting position',
      'Maintain straight body alignment'
    ],
    requirements: ['Flat surface', 'Good lighting', 'Camera at side angle'],
    icon: '💪'
  },
  {
    id: '3',
    name: 'Agility Test',
    description: 'Measure speed and coordination',
    category: 'fitness',
    duration: 45,
    instructions: [
      'Set up cones in T-shape',
      'Run forward, touch each cone',
      'Return to start position',
      'Complete as many rounds as possible'
    ],
    requirements: ['3 cones', 'Clear 10x10m area', 'Camera at elevated position'],
    icon: '🏃‍♀️'
  },
  {
    id: '4',
    name: 'Balance Test',
    description: 'Test stability and core strength',
    category: 'fitness',
    duration: 30,
    instructions: [
      'Stand on one leg',
      'Raise other leg to 90 degrees',
      'Hold position for 30 seconds',
      'Switch legs and repeat'
    ],
    requirements: ['Flat surface', 'Good lighting', 'Camera at front angle'],
    icon: '⚖️'
  }
];

export const COLORS = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#EC4899',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceDark: '#1E293B',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  borderDark: '#374151',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};