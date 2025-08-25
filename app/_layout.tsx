import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import BiometricAuthScreen from '@/components/BiometricAuthScreen';
import { AuthProvider } from '@/contexts/AuthContext';

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
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      checkAuthState();
    }
  }, [loaded]);

  const checkAuthState = async () => {
    try {
      // Verificar si el usuario ya se autenticó en esta sesión
      const authState = await AsyncStorage.getItem('biometric_auth_state');
      if (authState === 'authenticated') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleAuthSuccess = async () => {
    try {
      // Guardar estado de autenticación
      await AsyncStorage.setItem('biometric_auth_state', 'authenticated');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const handleAuthSkip = () => {
    // Permitir acceso sin autenticación (opcional)
    setIsAuthenticated(true);
  };

  if (!loaded || isCheckingAuth) {
    return null;
  }

  // Mostrar pantalla de autenticación si no está autenticado
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1 }}>
        <BiometricAuthScreen
          onAuthSuccess={handleAuthSuccess}
          onAuthSkip={handleAuthSkip}
          allowSkip={false} // Cambiar a true si quieres permitir saltar la autenticación
        />
      </View>
    );
  }

  return (
    <AuthProvider initialAuthState={isAuthenticated}>
      <RootLayoutNav />
    </AuthProvider>
  );
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
