import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ScrollView, Clipboard, RefreshControl, DeviceEventEmitter, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Text, View } from '@/components/Themed';
import { useDatabase, DatabasePassword } from '@/hooks/useDatabase';
import { PasswordOptions } from '@/services/DatabaseService';
import SecurityStats from '@/components/SecurityStats';
import AccountCard from '@/components/AccountCard';
import AccountSearchAndFilter from '@/components/AccountSearchAndFilter';
import AddPasswordForm from '@/components/AddPasswordForm';

export default function PasswordHistoryScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredPasswords, setFilteredPasswords] = useState<DatabasePassword[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const { 
    isReady: isDatabaseReady,
    isLoading: isDatabaseLoading,
    passwords: passwordHistory,
    deletePassword,
    clearAll,
    loadPasswords,
    exportData,
    markAsUsed,
    error: databaseError 
  } = useDatabase();

  // Inicializar contraseñas filtradas cuando cambie el historial
  useEffect(() => {
    setFilteredPasswords(passwordHistory);
  }, [passwordHistory]);

  // Mostrar error si existe
  useEffect(() => {
    if (databaseError) {
      Alert.alert('Error de Base de Datos', databaseError);
    }
  }, [databaseError]);

  // Suscribirse a eventos de actualización del historial
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'passwordHistoryUpdated',
      () => {
        loadPasswords(); // Recargar desde la base de datos
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
      if (isDatabaseReady) {
        loadPasswords();
      }
    }, [isDatabaseReady, loadPasswords])
  );

  const onRefresh = async () => {
    if (!isDatabaseReady) {
      return;
    }

    try {
      setIsRefreshing(true);
      await loadPasswords();
      console.log('✅ Historial actualizado desde base de datos');
    } catch (error) {
      console.error('❌ Error actualizando historial:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = (password: string) => {
    Clipboard.setString(password);
    Alert.alert('¡Copiado!', 'Contraseña copiada al portapapeles');
  };

  const exportPasswords = async () => {
    if (!isDatabaseReady) {
      Alert.alert('Error', 'La base de datos no está lista');
      return;
    }

    try {
      const exportString = await exportData();
      
      if (exportString) {
        // Copiar al portapapeles
        Clipboard.setString(exportString);
        Alert.alert(
          'Exportación Exitosa', 
          'Los datos han sido copiados al portapapeles en formato JSON.\n\nGuarda este texto en un lugar seguro como backup.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No se pudieron exportar los datos');
      }
    } catch (error) {
      console.error('❌ Error exportando datos:', error);
      Alert.alert('Error', 'No se pudieron exportar los datos');
    }
  };

  const deletePasswordFromHistory = async (id: string) => {
    if (!isDatabaseReady) {
      Alert.alert('Error', 'La base de datos no está lista');
      return;
    }

    try {
      const success = await deletePassword(id);
      
      if (success) {
        Alert.alert('Eliminado', 'Contraseña eliminada del historial de forma segura');
      } else {
        Alert.alert('Error', 'No se pudo eliminar la contraseña');
      }
    } catch (error) {
      console.error('❌ Error eliminando contraseña:', error);
      Alert.alert('Error', 'No se pudo eliminar la contraseña de forma segura');
    }
  };

  const clearAllHistory = async () => {
    if (!isDatabaseReady) {
      Alert.alert('Error', 'La base de datos no está lista');
      return;
    }

    Alert.alert(
      'Limpiar Historial',
      '¿Estás seguro de que quieres eliminar todo el historial de contraseñas? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await clearAll();
              
              if (success) {
                // Emitir evento para mantener sincronizado el historial
                DeviceEventEmitter.emit('passwordHistoryUpdated');
                Alert.alert('Historial eliminado', 'El historial se ha limpiado de forma segura');
              } else {
                Alert.alert('Error', 'No se pudo limpiar el historial');
              }
            } catch (error) {
              console.error('❌ Error limpiando historial de forma segura:', error);
              Alert.alert('Error', 'No se pudo limpiar el historial de forma segura');
            }
          }
        }
      ]
    );
  };

  const getPasswordStrength = (options: PasswordOptions) => {
    let strength = 0;
    
    // Adaptar a la nueva estructura de opciones de la base de datos
    if (options.includeNumbers) strength++;
    if (options.includeSymbols) strength++;
    if (options.length >= 12) strength++;
    if (options.length >= 16) strength++;
    
    if (options.length >= 16 && strength >= 3) return { level: 'Muy Fuerte', color: '#4CAF50' };
    if (options.length >= 12 && strength >= 3) return { level: 'Fuerte', color: '#8BC34A' };
    if (options.length >= 8 && strength >= 2) return { level: 'Media', color: '#FF9800' };
    return { level: 'Débil', color: '#F44336' };
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="key" size={40} color="#007AFF" />
            <View>
              <Text style={styles.title}>Mis Cuentas</Text>
              <Text style={styles.subtitle}>
                {filteredPasswords.length} de {passwordHistory.length} cuenta{passwordHistory.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowSearch(true)} style={styles.headerButton}>
              <Ionicons name="search" size={24} color="#007AFF" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowAddForm(true)} style={styles.headerButton}>
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
            
            {passwordHistory.length > 0 && (
              <TouchableOpacity onPress={exportPasswords} style={styles.headerButton}>
                <Ionicons name="download-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <SecurityStats />

        {isDatabaseLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando cuentas...</Text>
          </View>
        ) : filteredPasswords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {passwordHistory.length === 0 ? 'No hay cuentas guardadas' : 'No se encontraron cuentas'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {passwordHistory.length === 0 
                ? 'Agrega tu primera cuenta tocando el botón +'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </Text>
            {passwordHistory.length === 0 && (
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={() => setShowAddForm(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addFirstButtonText}>Agregar Primera Cuenta</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredPasswords}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AccountCard
                account={item}
                onDelete={deletePasswordFromHistory}
                onMarkAsUsed={markAsUsed}
              />
            )}
            style={styles.accountsList}
            contentContainerStyle={styles.accountsListContent}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {passwordHistory.length > 0 && (
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.clearAllButton} onPress={clearAllHistory}>
              <Ionicons name="trash" size={20} color="#FF3B30" />
              <Text style={styles.clearAllText}>Eliminar Todas</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modales */}
      <AccountSearchAndFilter
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        accounts={passwordHistory}
        onFilteredAccountsChange={setFilteredPasswords}
      />

      <AddPasswordForm
        visible={showAddForm}
        onClose={() => setShowAddForm(false)}
        onPasswordAdded={() => {
          Alert.alert('Cuenta Agregada', 'La nueva cuenta ha sido guardada de forma segura.');
        }}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  accountsList: {
    flex: 1,
  },
  accountsListContent: {
    padding: 20,
    paddingBottom: 40,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    marginLeft: 15,
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
