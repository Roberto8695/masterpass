import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '@/hooks/useDatabase';

interface SecurityStatsProps {
  onRefresh?: () => void;
}

export default function SecurityStats({ onRefresh }: SecurityStatsProps) {
  const [localStats, setLocalStats] = useState({
    totalPasswords: 0,
    lastModified: 'Never',
    strongPasswords: 0,
    moderatePasswords: 0,
    weakPasswords: 0
  });
  const [loading, setLoading] = useState(true);

  const { 
    isReady: isDatabaseReady, 
    passwords, 
    stats: databaseStats, 
    exportData,
    loadStats
  } = useDatabase();

  useEffect(() => {
    if (isDatabaseReady && databaseStats) {
      calculateSecurityStats();
    }
  }, [isDatabaseReady, databaseStats, passwords]);

  // Suscribirse a eventos de actualización del historial
  useEffect(() => {
    const { DeviceEventEmitter } = require('react-native');
    
    const subscription = DeviceEventEmitter.addListener(
      'passwordHistoryUpdated',
      () => {
        // Esperar un poco para que se complete la actualización de la base de datos
        setTimeout(() => {
          if (isDatabaseReady) {
            calculateSecurityStats();
          }
        }, 500);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isDatabaseReady]);

  const calculateSecurityStats = () => {
    try {
      setLoading(true);
      
      // Analizar fortaleza de cada contraseña
      let strongPasswords = 0;
      let moderatePasswords = 0;
      let weakPasswords = 0;
      let lastModified = 'Never';
      
      if (passwords && passwords.length > 0) {
        // Encontrar la fecha de última modificación más reciente
        const newestPassword = passwords.reduce((latest, current) => 
          current.lastModified > latest.lastModified ? current : latest
        );
        lastModified = newestPassword.lastModified.toISOString();

        // Analizar fortaleza de cada contraseña
        passwords.forEach(password => {
          const strength = analyzePasswordStrength(password.password, password.options);
          if (strength >= 70) {
            strongPasswords++;
          } else if (strength >= 50) {
            moderatePasswords++;
          } else {
            weakPasswords++;
          }
        });
      }

      setLocalStats({
        totalPasswords: databaseStats?.totalPasswords || 0,
        lastModified,
        strongPasswords,
        moderatePasswords,
        weakPasswords
      });
    } catch (error) {
      console.error('❌ Error calculando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para analizar la fortaleza de una contraseña
  const analyzePasswordStrength = (password: string, options: any) => {
    let score = 0;
    
    // Longitud (40 puntos máximo)
    if (password.length >= 20) score += 40;
    else if (password.length >= 15) score += 35;
    else if (password.length >= 12) score += 25;
    else if (password.length >= 8) score += 15;
    else score += 5;
    
    // Complejidad de caracteres (60 puntos máximo)
    let characterTypes = 0;
    
    if (/[a-z]/.test(password)) {
      score += 15;
      characterTypes++;
    }
    if (/[A-Z]/.test(password)) {
      score += 15;
      characterTypes++;
    }
    if (/\d/.test(password)) {
      score += 15;
      characterTypes++;
    }
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
      score += 15;
      characterTypes++;
    }
    
    // Bonus por diversidad de caracteres
    if (characterTypes >= 4) score += 10;
    else if (characterTypes >= 3) score += 5;
    
    // Penalización por patrones comunes
    if (/(.)\1{2,}/.test(password)) score -= 10; // Caracteres repetidos
    if (/123|abc|qwe|password|admin/i.test(password)) score -= 20; // Patrones comunes
    
    return Math.max(0, Math.min(score, 100));
  };

  const handleExportVault = async () => {
    try {
      const exportedData = await exportData();
      
      if (exportedData) {
        Alert.alert(
          'Vault Exportado',
          'Tu vault se ha exportado de forma segura. Los datos están completamente encriptados.',
          [
            {
              text: 'Ver Datos Encriptados',
              onPress: () => {
                Alert.alert(
                  'Datos Encriptados',
                  `Longitud: ${exportedData.length} caracteres\n\nEstos datos están completamente encriptados y solo pueden ser leídos por tu dispositivo.`,
                  [{ text: 'OK' }]
                );
              }
            },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Error', 'No se pudo exportar el vault');
      }
    } catch (error) {
      console.error('❌ Error exportando vault:', error);
      Alert.alert('Error', 'No se pudo exportar el vault de forma segura');
    }
  };

  const getSecurityScore = () => {
    if (localStats.totalPasswords === 0) return 0;
    
    // Calcular score basado en la distribución de fortaleza
    const strongWeight = localStats.strongPasswords * 100;
    const moderateWeight = localStats.moderatePasswords * 60;
    const weakWeight = localStats.weakPasswords * 20;
    
    const totalWeight = strongWeight + moderateWeight + weakWeight;
    const averageScore = totalWeight / localStats.totalPasswords;
    
    return Math.round(averageScore);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const formatLastModified = (lastModified: string) => {
    if (lastModified === 'Never') return 'Nunca';
    try {
      return new Date(lastModified).toLocaleString('es-ES');
    } catch {
      return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  const securityScore = getSecurityScore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
        <Text style={styles.title}>Estadísticas de Seguridad</Text>
        <TouchableOpacity onPress={calculateSecurityStats} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {/* Score de Seguridad */}
        <View style={[styles.statCard, styles.scoreCard]}>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: getScoreColor(securityScore) }]}>
              {securityScore}%
            </Text>
            <Text style={styles.scoreLabel}>Score de Seguridad</Text>
          </View>
        </View>

        {/* Total de Contraseñas */}
        <View style={styles.statCard}>
          <Ionicons name="key" size={20} color="#007AFF" />
          <Text style={styles.statNumber}>{localStats.totalPasswords}</Text>
          <Text style={styles.statLabel}>Total Contraseñas</Text>
        </View>

        {/* Contraseñas Fuertes */}
        <View style={styles.statCard}>
          <Ionicons name="shield" size={20} color="#4CAF50" />
          <Text style={styles.statNumber}>{localStats.strongPasswords}</Text>
          <Text style={styles.statLabel}>Contraseñas Fuertes</Text>
        </View>

        {/* Contraseñas Moderadas */}
        <View style={styles.statCard}>
          <Ionicons name="shield-half" size={20} color="#FF9800" />
          <Text style={styles.statNumber}>{localStats.moderatePasswords}</Text>
          <Text style={styles.statLabel}>Contraseñas Moderadas</Text>
        </View>

        {/* Contraseñas Débiles */}
        <View style={styles.statCard}>
          <Ionicons name="warning" size={20} color="#F44336" />
          <Text style={styles.statNumber}>{localStats.weakPasswords}</Text>
          <Text style={styles.statLabel}>Contraseñas Débiles</Text>
        </View>
      </View>

      {/* Información adicional */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.infoText}>
            Última modificación: {formatLastModified(localStats.lastModified)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="lock-closed" size={16} color="#4CAF50" />
          <Text style={styles.infoText}>
            Todas las contraseñas están encriptadas con AES-256
          </Text>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportVault}>
          <Ionicons name="download" size={16} color="#007AFF" />
          <Text style={styles.exportButtonText}>Exportar Vault</Text>
        </TouchableOpacity>

        {onRefresh && (
          <TouchableOpacity style={styles.refreshMainButton} onPress={onRefresh}>
            <Ionicons name="reload" size={16} color="#666" />
            <Text style={styles.refreshMainButtonText}>Actualizar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  scoreCard: {
    width: '100%',
    marginBottom: 12,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#0369a1',
    marginLeft: 6,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
    flex: 1,
    marginRight: 8,
  },
  exportButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  refreshMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  refreshMainButtonText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
});
