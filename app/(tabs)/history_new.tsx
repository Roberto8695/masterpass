import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, RefreshControl, Clipboard } from 'react-native';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '../../hooks/useDatabase';
import { DatabasePassword } from '../../hooks/useDatabase';
import SecurityStats from '../../components/SecurityStats';
import AddPasswordForm from '../../components/AddPasswordForm';
import AccountCard from '../../components/AccountCard';
import AccountSearchAndFilter from '../../components/AccountSearchAndFilter';

export default function HistoryScreen() {
  const { 
    passwords,
    deletePassword,
    clearAll,
    markAsUsed,
    isLoading,
    loadPasswords 
  } = useDatabase();

  const [filteredPasswords, setFilteredPasswords] = useState<DatabasePassword[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setFilteredPasswords(passwords);
  }, [passwords]);

  const copyToClipboard = async (text: string) => {
    Clipboard.setString(text);
    Alert.alert('¡Copiado!', 'Contraseña copiada al portapapeles');
  };

  const clearAllHistory = () => {
    if (passwords.length === 0) return;
    
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar todas las cuentas? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar Todo', 
          style: 'destructive',
          onPress: () => {
            clearAll();
            Alert.alert('Eliminado', 'Todas las cuentas han sido eliminadas.');
          }
        }
      ]
    );
  };

  const handleMarkAsUsed = async (id: string) => {
    await markAsUsed(id);
    Alert.alert('Marcado', 'Contraseña marcada como usada');
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadPasswords();
    setIsRefreshing(false);
  };

  const exportPasswords = () => {
    Alert.alert('Exportar', 'Funcionalidad de exportación próximamente');
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
                {filteredPasswords.length} de {passwords.length} cuenta{passwords.length !== 1 ? 's' : ''}
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
            
            {passwords.length > 0 && (
              <TouchableOpacity onPress={exportPasswords} style={styles.headerButton}>
                <Ionicons name="download-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <SecurityStats />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando cuentas...</Text>
          </View>
        ) : filteredPasswords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {passwords.length === 0 ? 'No hay cuentas guardadas' : 'No se encontraron cuentas'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {passwords.length === 0 
                ? 'Agrega tu primera cuenta tocando el botón +'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </Text>
            {passwords.length === 0 && (
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
                onDelete={deletePassword}
                onMarkAsUsed={handleMarkAsUsed}
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

        {passwords.length > 0 && (
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
        accounts={passwords}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
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
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  accountsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  accountsListContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7d7',
    gap: 8,
  },
  clearAllText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
});
