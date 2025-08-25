import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ScrollView, Clipboard, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/contexts/AuthContext';

interface PasswordOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  length: number;
}

interface PasswordHistoryItem {
  id: string;
  password: string;
  date: string;
  options: PasswordOptions;
}

export default function PasswordGeneratorScreen() {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    length: 12,
  });
  
  const { logout } = useAuth();

  const savePasswordToHistory = async (newPassword: string) => {
    try {
      const newHistoryItem: PasswordHistoryItem = {
        id: Date.now().toString(),
        password: newPassword,
        date: new Date().toLocaleString('es-ES'),
        options: { ...options }
      };

      // Cargar historial existente
      const storedHistory = await AsyncStorage.getItem('passwordHistory');
      const currentHistory = storedHistory ? JSON.parse(storedHistory) : [];
      
      const updatedHistory = [newHistoryItem, ...currentHistory].slice(0, 20); // Mantener solo las últimas 20
      await AsyncStorage.setItem('passwordHistory', JSON.stringify(updatedHistory));
      
      // Emitir evento para notificar que el historial se actualizó
      DeviceEventEmitter.emit('passwordHistoryUpdated', updatedHistory);
    } catch (error) {
      console.error('Error saving password to history:', error);
    }
  };

  const generatePassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÑ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyzñ';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?¿/';

    let charset = '';
    if (options.uppercase) charset += uppercaseChars;
    if (options.lowercase) charset += lowercaseChars;
    if (options.numbers) charset += numberChars;
    if (options.symbols) charset += symbolChars;

    if (charset === '') {
      Alert.alert('Error', 'Selecciona al menos un tipo de caracter');
      return;
    }

    let result = '';
    for (let i = 0; i < options.length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setPassword(result);
    // Guardar en el historial
    savePasswordToHistory(result);
  };

  const copyToClipboard = () => {
    if (password) {
      Clipboard.setString(password);
      Alert.alert('¡Copiado!', 'Contraseña copiada al portapapeles');
    }
  };

  const toggleOption = (option: keyof Omit<PasswordOptions, 'length'>) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const updateLength = (increment: boolean) => {
    setOptions(prev => ({
      ...prev,
      length: increment 
        ? Math.min(prev.length + 1, 50) 
        : Math.max(prev.length - 1, 4)
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar la sesión? Tendrás que autenticarte nuevamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={40} color="#4CAF50" />
        <Text style={styles.title}>Generador de Contraseñas</Text>
        <Text style={styles.subtitle}>Crea contraseñas seguras y únicas</Text>
      </View>

      {/* Contraseña generada */}
      <View style={styles.passwordContainer}>
        <Text style={styles.passwordLabel}>Contraseña Generada:</Text>
        <View style={styles.passwordBox}>
          <Text style={styles.passwordText} selectable>
            {password || 'Presiona "Generar" para crear una contraseña'}
          </Text>
          {password && (
            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
              <Ionicons name="copy" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
{/* Botón generar */}
      <TouchableOpacity style={styles.generateButton} onPress={generatePassword}>
        <Ionicons name="refresh" size={24} color="white" />
        <Text style={styles.generateButtonText}>Generar Contraseña</Text>
      </TouchableOpacity>
      {/* Opciones de configuración */}
      <View style={styles.optionsContainer}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        {/* Longitud */}
        <View style={styles.lengthContainer}>
          <Text style={styles.optionLabel}>Longitud: {options.length} caracteres</Text>
          <View style={styles.lengthControls}>
            <TouchableOpacity 
              style={styles.lengthButton} 
              onPress={() => updateLength(false)}
            >
              <Ionicons name="remove" size={20} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.lengthValue}>{options.length}</Text>
            <TouchableOpacity 
              style={styles.lengthButton} 
              onPress={() => updateLength(true)}
            >
              <Ionicons name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tipos de caracteres */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => toggleOption('uppercase')}
          >
            <Ionicons 
              name={options.uppercase ? "checkbox" : "square-outline"} 
              size={24} 
              color={options.uppercase ? "#4CAF50" : "#666"} 
            />
            <Text style={styles.checkboxLabel}>Mayúsculas (A-Z)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => toggleOption('lowercase')}
          >
            <Ionicons 
              name={options.lowercase ? "checkbox" : "square-outline"} 
              size={24} 
              color={options.lowercase ? "#4CAF50" : "#666"} 
            />
            <Text style={styles.checkboxLabel}>Minúsculas (a-z)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => toggleOption('numbers')}
          >
            <Ionicons 
              name={options.numbers ? "checkbox" : "square-outline"} 
              size={24} 
              color={options.numbers ? "#4CAF50" : "#666"} 
            />
            <Text style={styles.checkboxLabel}>Números (0-9)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => toggleOption('symbols')}
          >
            <Ionicons 
              name={options.symbols ? "checkbox" : "square-outline"} 
              size={24} 
              color={options.symbols ? "#4CAF50" : "#666"} 
            />
            <Text style={styles.checkboxLabel}>Símbolos (!@#$%^&*)</Text>
          </TouchableOpacity>
        </View>
      </View>

      

      {/* Información de seguridad */}
      <View style={styles.securityInfo}>
        <Ionicons name="information-circle" size={20} color="#FF9500" />
        <Text style={styles.securityText}>
          Recomendamos usar al menos 12 caracteres con todos los tipos habilitados para máxima seguridad.
        </Text>
      </View>

      {/* Botón de logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#ff4757" />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  passwordContainer: {
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  passwordLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  passwordBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 24,
  },
  copyButton: {
    padding: 8,
    marginLeft: 10,
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  lengthContainer: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  optionLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  lengthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
  },
  lengthButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lengthValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
    color: '#333',
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  logoutButtonText: {
    color: '#ff4757',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
