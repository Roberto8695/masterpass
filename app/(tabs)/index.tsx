import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ScrollView, Clipboard, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/contexts/AuthContext';
import { useDatabase } from '@/hooks/useDatabase';
import AddPasswordForm from '@/components/AddPasswordForm';

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
    length: 15,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { logout } = useAuth();
  const { 
    isReady: isDatabaseReady, 
    isLoading: isDatabaseLoading,
    savePassword: saveToDatabase,
    error: databaseError 
  } = useDatabase();

  // Mostrar error de base de datos si existe
  useEffect(() => {
    if (databaseError) {
      Alert.alert(
        'Error de Base de Datos',
        databaseError,
        [{ text: 'OK' }]
      );
    }
  }, [databaseError]);

  const savePasswordToHistory = async (newPassword: string) => {
    if (!isDatabaseReady) {
      console.warn('⚠️ Base de datos no está lista');
      return;
    }

    try {
      // Convertir opciones al formato de la base de datos
      const dbOptions = {
        length: options.length,
        includeNumbers: options.numbers,
        includeSymbols: options.symbols,
      };

      // Guardar en la base de datos SQLite encriptada
      const passwordId = await saveToDatabase(
        newPassword, 
        dbOptions,
        'Contraseña General'
      );
      
      if (passwordId) {
        // Emitir evento para notificar que el historial se actualizó
        DeviceEventEmitter.emit('passwordHistoryUpdated');
        console.log('✅ Contraseña guardada en base de datos encriptada');
      } else {
        throw new Error('No se pudo guardar la contraseña');
      }
    } catch (error) {
      console.error('❌ Error guardando contraseña en BD:', error);
      Alert.alert(
        'Error',
        'No se pudo guardar la contraseña en la base de datos. Inténtalo de nuevo.'
      );
    }
  };

  const generatePassword = () => {
    // Validar longitud mínima de seguridad
    if (options.length < 15) {
      Alert.alert(
        'Longitud Insegura', 
        'Por seguridad, se requiere un mínimo de 15 caracteres. La longitud se ajustará automáticamente.',
        [{ text: 'OK' }]
      );
      setOptions(prev => ({ ...prev, length: 15 }));
      return;
    }

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
    
    // Guardar automáticamente en el historial (AsyncStorage para compatibilidad)
    savePasswordToHistory(result);
    
    // Preguntar si quiere guardar como cuenta específica
    setTimeout(() => {
      Alert.alert(
        '¿Guardar como cuenta?',
        '¿Te gustaría guardar esta contraseña para un sitio web o aplicación específica?',
        [
          { text: 'No, gracias', style: 'cancel' },
          { 
            text: 'Sí, guardar',
            onPress: () => setShowAddForm(true)
          }
        ]
      );
    }, 500);
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
        : Math.max(prev.length - 1, 15)
    }));
  };

  const getPasswordStrength = () => {
    if (!password) return { level: 'none', color: '#ccc', text: 'Genera una contraseña' };
    
    const length = password.length;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?¿/]/.test(password);
    
    let score = 0;
    if (length >= 15) score += 2;
    if (length >= 20) score += 1;
    if (hasUpper) score += 1;
    if (hasLower) score += 1;
    if (hasNumbers) score += 1;
    if (hasSymbols) score += 1;
    
    if (length < 15) {
      return { level: 'insecure', color: '#dc3545', text: 'Insegura (< 15 caracteres)' };
    } else if (score <= 4) {
      return { level: 'weak', color: '#fd7e14', text: 'Débil' };
    } else if (score <= 6) {
      return { level: 'good', color: '#ffc107', text: 'Buena' };
    } else {
      return { level: 'strong', color: '#28a745', text: 'Muy Fuerte' };
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar la sesión? Tendrás que usar tu huella digital para volver a acceder.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            // El AuthProvider automáticamente cambiará isAuthenticated a false
            // y esto hará que se muestre la pantalla de autenticación biométrica
          }
        },
      ]
    );
  };

  return (
    <>
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
            <View style={styles.passwordActions}>
              <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                <Ionicons name="copy" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addAccountButton} 
                onPress={() => setShowAddForm(true)}
              >
                <Ionicons name="add-circle" size={20} color="#28a745" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Indicador de fortaleza */}
        {password && (
          <View style={styles.strengthContainer}>
            <Text style={[styles.strengthText, { color: getPasswordStrength().color }]}>
              🔒 Fortaleza: {getPasswordStrength().text}
            </Text>
          </View>
        )}
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
          <Text style={styles.securityNote}>
            🔒 Mínimo 15 caracteres para máxima seguridad
          </Text>
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
          Recomendamos usar al menos 15 caracteres con todos los tipos habilitados para máxima seguridad.
        </Text>
      </View>

      {/* Botón de logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#ff4757" />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
      </ScrollView>

      {/* Modal para agregar como cuenta */}
      <AddPasswordForm
        visible={showAddForm}
        onClose={() => setShowAddForm(false)}
        onPasswordAdded={() => {
          DeviceEventEmitter.emit('passwordHistoryUpdated');
          Alert.alert('Cuenta Agregada', 'La contraseña ha sido guardada como una nueva cuenta.');
        }}
        initialPassword={password}
      />
    </>
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
  strengthContainer: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  copyButton: {
    padding: 8,
    marginLeft: 10,
  },
  passwordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addAccountButton: {
    padding: 8,
    marginLeft: 8,
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
  securityNote: {
    fontSize: 12,
    marginBottom: 10,
    color: '#28a745',
    fontStyle: 'italic',
    textAlign: 'center',
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
