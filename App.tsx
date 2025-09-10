import { initializeOpenRouter } from './src/services/openRouterService';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';
// initialize with API key and a preferred model; change model if your OpenRouter account provides a different one
import Constants from 'expo-constants';

// Try to load a local .env file when available (development).
// Use a dynamic require via eval so Metro doesn't statically bundle Node-only modules like 'path'.
try {
  // avoid static analysis by Metro bundler
  // eslint-disable-next-line no-eval
  const req: any = eval("typeof require !== 'undefined' ? require : undefined");
  if (req) {
    const dotenv = req('dotenv');
    if (dotenv && typeof dotenv.config === 'function') dotenv.config();
  }
} catch (e) {
  // ignore if dotenv isn't installed or not usable in the current runtime
}

const apiKey =
  process.env.OPENROUTER_API_KEY ||
  Constants.expoConfig?.extra?.OPENROUTER_API_KEY ||
  // older Expo versions
  (Constants as any).manifest?.extra?.OPENROUTER_API_KEY ||
  '';

if (!apiKey) {
  console.warn('[OpenRouter] OPENROUTER_API_KEY not found; OpenRouter not initialized.');
} else {
  initializeOpenRouter(apiKey, 'openrouter/sonoma-sky-alpha');
  console.info('[OpenRouter] initialized with key from environment.');
}
export default function App() {
  const [fontsLoaded] = useFonts({
    'NotoSansDevanagari': require('./assets/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf'),
    'NotoSansBengali': require('./assets/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf'),
    'NotoSansTelugu': require('./assets/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf'),
    'NotoSansTamil': require('./assets/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf'),
    'NotoSansGujarati': require('./assets/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf'),
    'NotoSansKannada': require('./assets/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf'),
    'NotoSansMalayalam': require('./assets/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf'),
    'NotoSansGurmukhi': require('./assets/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

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
