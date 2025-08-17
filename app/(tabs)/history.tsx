import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ScrollView, Clipboard, RefreshControl, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View } from '@/components/Themed';

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

export default function PasswordHistoryScreen() {
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cargar historial al iniciar la app y cuando se enfoque la pestaña
  useEffect(() => {
    loadPasswordHistory();

    // Suscribirse a eventos de actualización del historial
    const subscription = DeviceEventEmitter.addListener(
      'passwordHistoryUpdated',
      (updatedHistory) => {
        setPasswordHistory(updatedHistory);
      }
    );

    // Cleanup: remover el listener cuando el componente se desmonte
    return () => {
      subscription.remove();
    };
  }, []);

  // Recargar historial cuando la pestaña se enfoque
  useFocusEffect(
    useCallback(() => {
      loadPasswordHistory();
    }, [])
  );

  const loadPasswordHistory = async () => {
    try {
      setIsRefreshing(true);
      const storedHistory = await AsyncStorage.getItem('passwordHistory');
      if (storedHistory) {
        setPasswordHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Error loading password history:', error);
      Alert.alert('Error', 'No se pudo cargar el historial');
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = (password: string) => {
    Clipboard.setString(password);
    Alert.alert('¡Copiado!', 'Contraseña copiada al portapapeles');
  };

  const deletePasswordFromHistory = async (id: string) => {
    try {
      const updatedHistory = passwordHistory.filter(item => item.id !== id);
      setPasswordHistory(updatedHistory);
      await AsyncStorage.setItem('passwordHistory', JSON.stringify(updatedHistory));
      
      // Emitir evento para mantener sincronizado el historial
      DeviceEventEmitter.emit('passwordHistoryUpdated', updatedHistory);
      
      Alert.alert('Eliminado', 'Contraseña eliminada del historial');
    } catch (error) {
      console.error('Error deleting password:', error);
      Alert.alert('Error', 'No se pudo eliminar la contraseña');
    }
  };

  const clearAllHistory = async () => {
    Alert.alert(
      'Limpiar Historial',
      '¿Estás seguro de que quieres eliminar todo el historial de contraseñas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('passwordHistory');
              setPasswordHistory([]);
              
              // Emitir evento para mantener sincronizado el historial
              DeviceEventEmitter.emit('passwordHistoryUpdated', []);
              
              Alert.alert('Historial eliminado', 'El historial se ha limpiado correctamente');
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'No se pudo limpiar el historial');
            }
          }
        }
      ]
    );
  };

  const getPasswordStrength = (options: PasswordOptions) => {
    let strength = 0;
    if (options.uppercase) strength++;
    if (options.lowercase) strength++;
    if (options.numbers) strength++;
    if (options.symbols) strength++;
    
    if (options.length >= 16 && strength >= 3) return { level: 'Muy Fuerte', color: '#4CAF50' };
    if (options.length >= 12 && strength >= 3) return { level: 'Fuerte', color: '#8BC34A' };
    if (options.length >= 8 && strength >= 2) return { level: 'Media', color: '#FF9800' };
    return { level: 'Débil', color: '#F44336' };
  };

  const onRefresh = () => {
    loadPasswordHistory();
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Ionicons name="time" size={40} color="#007AFF" />
        <Text style={styles.title}>Historial de Contraseñas</Text>
        <Text style={styles.subtitle}>
          {passwordHistory.length} contraseña{passwordHistory.length !== 1 ? 's' : ''} guardada{passwordHistory.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {passwordHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No hay contraseñas guardadas</Text>
          <Text style={styles.emptySubtitle}>
            Las contraseñas que generes aparecerán aquí automáticamente
          </Text>
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.clearAllButton} onPress={clearAllHistory}>
            <Ionicons name="trash" size={20} color="#FF3B30" />
            <Text style={styles.clearAllText}>Limpiar todo el historial</Text>
          </TouchableOpacity>

          {passwordHistory.map((item) => {
            const strength = getPasswordStrength(item.options);
            return (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyItemHeader}>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deletePasswordFromHistory(item.id)}
                  >
                    <Ionicons name="close-circle" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                  <Text style={styles.passwordText} numberOfLines={1}>
                    {item.password}
                  </Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(item.password)}
                  >
                    <Ionicons name="copy" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordInfo}>
                  <View style={styles.lengthInfo}>
                    <Ionicons name="resize" size={16} color="#666" />
                    <Text style={styles.infoText}>{item.options.length} caracteres</Text>
                  </View>
                  
                  <View style={[styles.strengthBadge, { backgroundColor: strength.color }]}>
                    <Text style={styles.strengthText}>{strength.level}</Text>
                  </View>
                </View>

                <View style={styles.optionsInfo}>
                  {item.options.uppercase && (
                    <View style={styles.optionChip}>
                      <Text style={styles.optionText}>ABC</Text>
                    </View>
                  )}
                  {item.options.lowercase && (
                    <View style={styles.optionChip}>
                      <Text style={styles.optionText}>abc</Text>
                    </View>
                  )}
                  {item.options.numbers && (
                    <View style={styles.optionChip}>
                      <Text style={styles.optionText}>123</Text>
                    </View>
                  )}
                  {item.options.symbols && (
                    <View style={styles.optionChip}>
                      <Text style={styles.optionText}>!@#</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </>
      )}
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: 'transparent',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  clearAllText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  deleteButton: {
    padding: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  passwordText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#333',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  passwordInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  lengthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  strengthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  strengthText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  optionsInfo: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  optionChip: {
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  optionText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
});
