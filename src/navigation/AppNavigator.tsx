import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { RootStackParamList, AuthStackParamList, UserStackParamList, AdminStackParamList } from '../types';
import { COLORS } from '../constants';

// Import screens (we'll create these next)
import LanguageSelectionScreen from '../screens/auth/LanguageSelectionScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import GovLoginScreen from '../screens/auth/GovLoginScreen';
import GovSignupScreen from '../screens/auth/GovSignupScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import UserDashboardScreen from '../screens/user/UserDashboardScreen';
import TestSelectionScreen from '../screens/user/TestSelectionScreen';
import CameraTestScreen from '../screens/user/CameraTestScreen';
import LeaderboardScreen from '../screens/user/LeaderboardScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import TestReportScreen from '../screens/user/TestReportScreen';
import EventDetailScreen from '../screens/user/EventDetailScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import TestManagementScreen from '../screens/admin/TestManagementScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';
import CreateEventScreen from '../screens/admin/CreateEventScreen';
import AdminLeaderboardScreen from '../screens/admin/AdminLeaderboardScreen';

// Enable native screens for better performance and fewer runtime issues
enableScreens(true);

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const UserTab = createBottomTabNavigator<UserStackParamList>();
const AdminDrawer = createDrawerNavigator<AdminStackParamList>();

// Auth Stack Navigator
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="GovLogin" component={GovLoginScreen} />
      <AuthStack.Screen name="GovSignup" component={GovSignupScreen} />
    </AuthStack.Navigator>
  );
};

// User Tab Navigator
const UserNavigator: React.FC = () => {
  return (
    <UserTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'UserDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TestSelection') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarItemStyle: { paddingVertical: 6 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerShown: false,
      })}
    >
      <UserTab.Screen 
        name="UserDashboard" 
        component={UserDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <UserTab.Screen 
        name="TestSelection" 
        component={TestSelectionScreen}
        options={{ tabBarLabel: 'Tests' }}
      />
      <UserTab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{ tabBarLabel: 'Leaderboard' }}
      />
      <UserTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
      
    </UserTab.Navigator>
  );
};

// Admin Drawer Navigator
const AdminNavigator: React.FC = () => {
  const { logout } = useApp();
  return (
    <AdminDrawer.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: COLORS.background,
        },
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.textSecondary,
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 12 }}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        ),
      }}
    >
      <AdminDrawer.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <AdminDrawer.Screen 
        name="UserManagement" 
        component={UserManagementScreen}
        options={{
          title: 'User Management',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <AdminDrawer.Screen 
        name="TestManagement" 
        component={TestManagementScreen}
        options={{
          title: 'Test Management',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="fitness" size={size} color={color} />
          ),
        }}
      />
      <AdminDrawer.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{
          title: 'Analytics',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
      <AdminDrawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <AdminDrawer.Screen 
        name="CreateEvent" 
        component={CreateEventScreen}
        options={{
          title: 'Create Event',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <AdminDrawer.Screen 
        name="AdminLeaderboard" 
        component={AdminLeaderboardScreen}
        options={{
          title: 'Leaderboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
    </AdminDrawer.Navigator>
  );
};

// Main App Navigator
const AppNavigator: React.FC = () => {
  const { state } = useApp();

  if (state.auth.loading) {
    // You can add a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!state.auth.isAuthenticated ? (
          // Not authenticated - show auth flow
          <>
            <RootStack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
            <RootStack.Screen name="Auth" component={AuthNavigator} />
            <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
          </>
        ) : (
          // Authenticated - show appropriate portal
          <>
            {state.auth.user?.role === 'user' ? (
              <RootStack.Screen name="UserPortal" component={UserNavigator} />
            ) : (
              <RootStack.Screen name="AdminPortal" component={AdminNavigator} />
            )}
            <RootStack.Screen name="CameraTest" component={CameraTestScreen} />
            <RootStack.Screen name="TestReport" component={TestReportScreen} />
            <RootStack.Screen name="EventDetail" component={EventDetailScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;