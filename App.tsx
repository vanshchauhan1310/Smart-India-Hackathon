import { initializeOpenRouter } from './src/services/openRouterService';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
// initialize with API key and a preferred model; change model if your OpenRouter account provides a different one
initializeOpenRouter('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', 'openrouter/sonoma-sky-alpha');
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
