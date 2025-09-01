import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, RefreshControl, DeviceEventEmitter } from 'react-native';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '../../hooks/useDatabase';

export default function BackupScreen() {
  const { 
    passwords,
    loadPasswords,
    exportData,
    exportToFile,
    exportToCSV,
    clearAll,
    isReady
  } = useDatabase();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportData = async () => {
    if (passwords.length === 0) {
      Alert.alert('Sin datos', 'No hay cuentas para exportar');
      return;
    }

    Alert.alert(
      'Exportar Datos',
      `Selecciona el formato de exportación para tus ${passwords.length} cuentas:\n\n� JSON: Formato completo con metadatos\n� CSV: Compatible con Excel y hojas de cálculo`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: '📊 Exportar CSV', 
          onPress: () => performExport('csv')
        },
        { 
          text: '📄 Exportar JSON', 
          onPress: () => performExport('json')
        }
      ]
    );
  };

  const performExport = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      const result = format === 'csv' 
        ? await exportToCSV() 
        : await exportToFile();

      if (result.success) {
        const formatName = format === 'csv' ? 'CSV' : 'JSON';
        Alert.alert(
          `✅ Exportación ${formatName} Exitosa`, 
          `Archivo creado: ${result.fileName}\n\n📁 Ubicación: Documentos del dispositivo\n📊 Total exportadas: ${passwords.length} cuentas\n\n${result.filePath ? `💡 El archivo se abrió automáticamente para compartir` : '💡 Puedes encontrar el archivo en tu gestor de archivos'}`,
          [{ text: 'Entendido' }]
        );
      } else {
        const formatName = format === 'csv' ? 'CSV' : 'JSON';
        Alert.alert(
          `Error de Exportación ${formatName}`, 
          result.error || `No se pudo crear el archivo ${formatName}`,
          [{ text: 'Entendido' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error', 
        'Error inesperado durante la exportación. Inténtalo de nuevo.',
        [{ text: 'Entendido' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllData = () => {
    if (passwords.length === 0) {
      Alert.alert('Sin datos', 'No hay datos para eliminar');
      return;
    }

    Alert.alert(
      '⚠️ Eliminar TODO',
      `¿Estás SEGURO de que quieres eliminar TODAS las ${passwords.length} cuentas guardadas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'SÍ, ELIMINAR TODO', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAll();
              Alert.alert('Eliminado', 'Todos los datos han sido eliminados');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron eliminar los datos');
            }
          }
        }
      ]
    );
  };

  const totalAccounts = passwords.length;
  const categoryCounts = passwords.reduce((acc, password) => {
    acc[password.category] = (acc[password.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="cloud-outline" size={40} color="#007AFF" />
          <View>
            <Text style={styles.title}>Respaldo y Datos</Text>
            <Text style={styles.subtitle}>Gestiona tu información de forma segura</Text>
          </View>
        </View>
      </View>

      {/* Estadísticas rápidas */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Ionicons name="bar-chart-outline" size={24} color="#007AFF" />
          <Text style={styles.statsTitle}>Resumen de Datos</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalAccounts}</Text>
            <Text style={styles.statLabel}>Cuentas totales</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Object.keys(categoryCounts).length}</Text>
            <Text style={styles.statLabel}>Categorías</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{passwords.filter(p => p.lastUsed).length}</Text>
            <Text style={styles.statLabel}>Usadas</Text>
          </View>
        </View>
      </View>

      {/* Acciones de respaldo */}
      <View style={styles.actionsCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>Acciones de Respaldo</Text>
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, styles.exportButton]}
          onPress={handleExportData}
          disabled={isExporting || totalAccounts === 0}
        >
          <Ionicons 
            name={isExporting ? "hourglass-outline" : "download-outline"} 
            size={20} 
            color={totalAccounts === 0 ? "#999" : "#4CAF50"} 
          />
          <View style={styles.actionTextContainer}>
            <Text style={[styles.actionButtonText, totalAccounts === 0 && styles.disabledText]}>
              {isExporting ? 'Exportando...' : 'Exportar Datos'}
            </Text>
            <Text style={[styles.actionSubtext, totalAccounts === 0 && styles.disabledText]}>
              Crear respaldo seguro de {totalAccounts} cuentas
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Zona de peligro */}
      <View style={styles.dangerCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="warning-outline" size={24} color="#FF3B30" />
          <Text style={[styles.cardTitle, styles.dangerTitle]}>Zona de Peligro</Text>
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleClearAllData}
          disabled={totalAccounts === 0}
        >
          <Ionicons 
            name="trash-outline" 
            size={20} 
            color={totalAccounts === 0 ? "#999" : "#FF3B30"} 
          />
          <View style={styles.actionTextContainer}>
            <Text style={[styles.dangerButtonText, totalAccounts === 0 && styles.disabledText]}>
              Eliminar Todos los Datos
            </Text>
            <Text style={[styles.actionSubtext, totalAccounts === 0 && styles.disabledText]}>
              ⚠️ Esta acción no se puede deshacer
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {totalAccounts === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={60} color="#ccc" />
          <Text style={styles.emptyTitle}>No hay datos para respaldar</Text>
          <Text style={styles.emptySubtext}>
            Agrega algunas cuentas primero en la pestaña "Mis Cuentas"
          </Text>
        </View>
      )}
    </ScrollView>
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
  statsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffebee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  dangerTitle: {
    color: '#FF3B30',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  exportButton: {
    backgroundColor: '#f0f9ff',
    borderColor: '#4CAF50',
  },
  dangerButton: {
    backgroundColor: '#fff5f5',
    borderColor: '#FF3B30',
  },
  actionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  actionSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  disabledText: {
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
