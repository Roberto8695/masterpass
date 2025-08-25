import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  setIsAuthenticated: (value: boolean) => void;
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

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('biometric_auth_state');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      logout,
      setIsAuthenticated,
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
