import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  AlertButton,
} from 'react-native';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { Ionicons } from '@expo/vector-icons';

interface BiometricAuthScreenProps {
  onAuthSuccess: () => void;
  onAuthSkip?: () => void;
  allowSkip?: boolean;
}

export default function BiometricAuthScreen({
  onAuthSuccess,
  onAuthSkip,
  allowSkip = false,
}: BiometricAuthScreenProps) {
  const {
    isAvailable,
    isAuthenticated,
    isLoading,
    error,
    authenticate,
  } = useBiometricAuth();

  useEffect(() => {
    if (isAuthenticated) {
      onAuthSuccess();
    }
  }, [isAuthenticated, onAuthSuccess]);

  const handleAuthenticate = async () => {
    if (!isAvailable) {
      const buttons: AlertButton[] = [
        { text: 'OK' },
      ];
      
      if (allowSkip && onAuthSkip) {
        buttons.unshift({ text: 'Continuar sin autenticación', onPress: onAuthSkip });
      }
      
      Alert.alert(
        'Autenticación no disponible',
        error || 'La autenticación biométrica no está disponible en este dispositivo',
        buttons
      );
      return;
    }

    const success = await authenticate();
    if (!success && error) {
      Alert.alert('Error de autenticación', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Verificando disponibilidad...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo de la app */}
        <Image
          source={require('../assets/images/masterpass.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>MasterPass</Text>
        <Text style={styles.subtitle}>Generador de Contraseñas Seguras</Text>
        
        {/* Icono biométrico */}
        <View style={styles.biometricIconContainer}>
          <Ionicons
            name="finger-print"
            size={80}
            color={isAvailable ? "#007AFF" : "#999"}
          />
        </View>
        
        <Text style={styles.description}>
          {isAvailable
            ? "Usa tu huella digital o reconocimiento facial para acceder de forma segura"
            : "La autenticación biométrica no está disponible"}
        </Text>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        {/* Botón de autenticación */}
        <TouchableOpacity
          style={[
            styles.authButton,
            !isAvailable && styles.authButtonDisabled
          ]}
          onPress={handleAuthenticate}
          disabled={!isAvailable}
        >
          <Ionicons
            name="finger-print"
            size={24}
            color={isAvailable ? "white" : "#999"}
            style={styles.buttonIcon}
          />
          <Text style={[
            styles.authButtonText,
            !isAvailable && styles.authButtonTextDisabled
          ]}>
            {isAvailable ? "Autenticar" : "No disponible"}
          </Text>
        </TouchableOpacity>
        
        {/* Botón para saltar autenticación (opcional) */}
        {allowSkip && onAuthSkip && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onAuthSkip}
          >
            <Text style={styles.skipButtonText}>
              Continuar sin autenticación
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  biometricIconContainer: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 30,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4757',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  authButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  authButtonDisabled: {
    backgroundColor: '#e9ecef',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    marginRight: 10,
  },
  authButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  authButtonTextDisabled: {
    color: '#999',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
