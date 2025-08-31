import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  setIsAuthenticated: (value: boolean) => void;
  forceReauth: () => void;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialAuthState: boolean;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  initialAuthState 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthState);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      // Limpiar todos los datos de autenticación
      await AsyncStorage.multiRemove([
        'biometric_auth_state',
        'session_auth_time'
      ]);
      setIsAuthenticated(false);
      setIsLoggingOut(false);
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoggingOut(false);
    }
  };

  const forceReauth = () => {
    // Forzar re-autenticación sin limpiar datos de la app
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      logout,
      setIsAuthenticated,
      forceReauth,
      isLoggingOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
