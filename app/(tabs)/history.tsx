import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, DeviceEventEmitter } from 'react-native';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase, DatabasePassword } from '../../hooks/useDatabase';

export default function HistoryScreen() {
  const { 
    passwords, 
    loadPasswords, 
    deletePassword,
    isReady 
  } = useDatabase();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'usage' | 'strength'>('date');

  // Cargar datos cuando la pantalla se monte
  useEffect(() => {
    if (isReady) {
      loadPasswords();
    }
  }, [isReady, loadPasswords]);

  // Escuchar eventos de actualización
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'passwordHistoryUpdated',
      () => {
        if (isReady) {
          loadPasswords();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isReady, loadPasswords]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadPasswords();
    setIsRefreshing(false);
  };

  const handleDeletePassword = (id: string, siteName: string) => {
    Alert.alert(
      'Eliminar Cuenta',
      `¿Estás seguro de que quieres eliminar la cuenta de ${siteName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePassword(id);
              Alert.alert('Eliminado', 'Cuenta eliminada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la cuenta');
            }
          }
        }
      ]
    );
  };

  const calculatePasswordStrength = (password: string): number => {
    let score = 0;
    
    // Longitud
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    
    // Mayúsculas
    if (/[A-Z]/.test(password)) score += 15;
    
    // Minúsculas
    if (/[a-z]/.test(password)) score += 15;
    
    // Números
    if (/\d/.test(password)) score += 15;
    
    // Símbolos
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    return Math.min(score, 100);
  };

  const getSortedPasswords = () => {
    const sorted = [...passwords];
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'usage':
        return sorted.sort((a, b) => {
          const aUsed = a.lastUsed ? 1 : 0;
          const bUsed = b.lastUsed ? 1 : 0;
          return bUsed - aUsed;
        });
      case 'strength':
        return sorted.sort((a, b) => {
          const aStrength = calculatePasswordStrength(a.password);
          const bStrength = calculatePasswordStrength(b.password);
          return bStrength - aStrength;
        });
      default:
        return sorted;
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return '#4CAF50';
    if (strength >= 60) return '#FF9800';
    return '#F44336';
  };

  const getStrengthText = (strength: number) => {
    if (strength >= 80) return 'Fuerte';
    if (strength >= 60) return 'Media';
    return 'Débil';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-ES');
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'social': return 'people-outline';
      case 'work': return 'briefcase-outline';
      case 'banking': return 'card-outline';
      case 'shopping': return 'storefront-outline';
      case 'entertainment': return 'game-controller-outline';
      case 'email': return 'mail-outline';
      default: return 'globe-outline';
    }
  };

  const renderPasswordItem = ({ item }: { item: DatabasePassword }) => {
    const strength = calculatePasswordStrength(item.password);
    
    return (
      <View style={styles.passwordItem}>
        <View style={styles.itemHeader}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: getStrengthColor(strength) + '20' }]}>
              <Ionicons 
                name={getCategoryIcon(item.category)} 
                size={24} 
                color={getStrengthColor(strength)} 
              />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.website} numberOfLines={1}>{item.siteName}</Text>
              <Text style={styles.username} numberOfLines={1}>
                {item.username || item.email || 'Sin usuario'}
              </Text>
              <View style={styles.metadata}>
                <Text style={styles.metadataText}>
                  {formatDate(item.createdAt)}
                </Text>
                {item.lastUsed && (
                  <>
                    <Text style={styles.metadataSeparator}>•</Text>
                    <Text style={styles.metadataText}>
                      Usada el {formatDate(item.lastUsed)}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleDeletePassword(item.id, item.siteName)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBar}>
            <View 
              style={[
                styles.strengthFill, 
                { 
                  width: `${strength}%`,
                  backgroundColor: getStrengthColor(strength)
                }
              ]} 
            />
          </View>
          <Text style={[styles.strengthText, { color: getStrengthColor(strength) }]}>
            {getStrengthText(strength)}
          </Text>
        </View>
      </View>
    );
  };

  const sortedPasswords = getSortedPasswords();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="time-outline" size={40} color="#007AFF" />
          <View>
            <Text style={styles.title}>Historial</Text>
            <Text style={styles.subtitle}>{sortedPasswords.length} cuentas guardadas</Text>
          </View>
        </View>
      </View>

      {/* Opciones de ordenamiento */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <View style={styles.sortButtons}>
          {[
            { key: 'date', label: 'Fecha', icon: 'calendar-outline' },
            { key: 'usage', label: 'Uso', icon: 'stats-chart-outline' },
            { key: 'strength', label: 'Seguridad', icon: 'shield-outline' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortButton,
                sortBy === option.key && styles.sortButtonActive
              ]}
              onPress={() => setSortBy(option.key as 'date' | 'usage' | 'strength')}
            >
              <Ionicons 
                name={option.icon as any} 
                size={16} 
                color={sortBy === option.key ? '#007AFF' : '#666'} 
              />
              <Text style={[
                styles.sortButtonText,
                sortBy === option.key && styles.sortButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {sortedPasswords.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Sin historial aún</Text>
          <Text style={styles.emptySubtext}>
            Las cuentas que crees aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedPasswords}
          renderItem={renderPasswordItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  sortContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  sortButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  sortButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  passwordItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  website: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: '#999',
  },
  metadataSeparator: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 6,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginRight: 12,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
});
