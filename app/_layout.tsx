import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import BiometricAuthScreen from '@/components/BiometricAuthScreen';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider initialAuthState={false}>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [isReturningToApp, setIsReturningToApp] = useState(false);

  useEffect(() => {
    // Siempre iniciar sin autenticación para forzar biometría
    setIsCheckingAuth(false);
  }, []);

  // Listener para detectar cuando la app vuelve del background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // La app volvió al foreground, pedir autenticación de nuevo
        setIsReturningToApp(true);
        setIsAuthenticated(false);
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [appState, setIsAuthenticated]);

  const handleAuthSuccess = async () => {
    try {
      // Guardar estado de autenticación temporal (solo para la sesión actual)
      await AsyncStorage.setItem('session_auth_time', Date.now().toString());
      setIsAuthenticated(true);
      setIsReturningToApp(false); // Reset flag después de autenticación exitosa
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const handleAuthSkip = () => {
    // No permitir saltar la autenticación para mayor seguridad
  };

  if (isCheckingAuth) {
    return null;
  }

  // Mostrar pantalla de autenticación si no está autenticado
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1 }}>
        <BiometricAuthScreen
          onAuthSuccess={handleAuthSuccess}
          onAuthSkip={handleAuthSkip}
          allowSkip={false} // No permitir saltar la autenticación
          isReturningToApp={isReturningToApp}
        />
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Recomendaciones' }} />
      </Stack>
    </ThemeProvider>
  );
}
