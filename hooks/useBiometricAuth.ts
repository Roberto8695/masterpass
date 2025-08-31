import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricAuthState {
  isAvailable: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useBiometricAuth = () => {
  const [authState, setAuthState] = useState<BiometricAuthState>({
    isAvailable: false,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Verificar si el dispositivo tiene hardware biométrico
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      
      if (!hasHardware) {
        setAuthState(prev => ({
          ...prev,
          isAvailable: false,
          isLoading: false,
          error: 'El dispositivo no tiene hardware biométrico'
        }));
        return;
      }

      // Verificar si hay datos biométricos registrados
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!isEnrolled) {
        setAuthState(prev => ({
          ...prev,
          isAvailable: false,
          isLoading: false,
          error: 'No hay datos biométricos registrados en el dispositivo'
        }));
        return;
      }

      setAuthState(prev => ({
        ...prev,
        isAvailable: true,
        isLoading: false,
        error: null
      }));

    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isAvailable: false,
        isLoading: false,
        error: 'Error al verificar disponibilidad biométrica'
      }));
    }
  };

  const authenticate = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirma tu identidad con tu huella digital o reconocimiento facial',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar PIN',
        disableDeviceFallback: false,
        requireConfirmation: false,
      });

      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }));
        return true;
      } else {
        let errorMessage = 'Falló la autenticación';
        
        // Manejar diferentes tipos de error basado en el string del error
        const errorStr = String(result.error);
        if (errorStr.includes('UserCancel') || errorStr.includes('cancel')) {
          errorMessage = 'Autenticación cancelada por el usuario';
        } else if (errorStr.includes('UserFallback')) {
          errorMessage = 'Se seleccionó método alternativo';
        } else if (errorStr.includes('BiometricUnavailable')) {
          errorMessage = 'Autenticación biométrica no disponible';
        } else if (errorStr.includes('NotEnrolled')) {
          errorMessage = 'No hay datos biométricos registrados';
        }
        
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage
        }));
        return false;
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        error: 'Error durante la autenticación'
      }));
      return false;
    }
  };

  const logout = () => {
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: false,
      error: null
    }));
  };

  return {
    ...authState,
    authenticate,
    logout,
    checkBiometricAvailability,
  };
};
