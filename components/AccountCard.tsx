import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Clipboard,
  Linking,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatabasePassword } from '@/hooks/useDatabase';

interface AccountCardProps {
  account: DatabasePassword;
  onDelete: (id: string) => void;
  onMarkAsUsed: (id: string) => void;
  onEdit: (account: DatabasePassword) => void;
}

export default function AccountCard({ account, onDelete, onMarkAsUsed, onEdit }: AccountCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'Redes Sociales': 'people',
      'Bancos': 'card',
      'Trabajo': 'briefcase',
      'Entretenimiento': 'play-circle',
      'Compras': 'storefront',
      'Email': 'mail',
      'Desarrollo': 'code-slash',
      'Educación': 'school',
      'Salud': 'medical',
      'Gobierno': 'business',
      'General': 'folder'
    };
    return iconMap[category] || 'folder';
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'Redes Sociales': '#1DA1F2',
      'Bancos': '#2E7D32',
      'Trabajo': '#FF6F00',
      'Entretenimiento': '#E91E63',
      'Compras': '#9C27B0',
      'Email': '#FF5722',
      'Desarrollo': '#607D8B',
      'Educación': '#3F51B5',
      'Salud': '#F44336',
      'Gobierno': '#795548',
      'General': '#9E9E9E'
    };
    return colorMap[category] || '#9E9E9E';
  };

  const getPasswordStrength = () => {
    const { password, options } = account;
    let strength = 0;
    
    if (options.length >= 12) strength++;
    if (options.length >= 16) strength++;
    if (options.includeNumbers) strength++;
    if (options.includeSymbols) strength++;

    if (options.length >= 16 && strength >= 3) {
      return { level: 'Muy Fuerte', color: '#4CAF50', score: strength };
    }
    if (options.length >= 12 && strength >= 2) {
      return { level: 'Fuerte', color: '#8BC34A', score: strength };
    }
    if (options.length >= 8 && strength >= 1) {
      return { level: 'Media', color: '#FF9800', score: strength };
    }
    return { level: 'Débil', color: '#F44336', score: strength };
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setString(text);
      Alert.alert('¡Copiado!', `${label} copiado al portapapeles`);
      
      // Marcar como usado cuando se copia la contraseña
      if (label === 'Contraseña') {
        onMarkAsUsed(account.id);
      }
    } catch (error) {
      Alert.alert('Error', `No se pudo copiar ${label.toLowerCase()}`);
    }
  };

  const openWebsite = async () => {
    if (!account.siteUrl) return;

    try {
      let url = account.siteUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        onMarkAsUsed(account.id);
      } else {
        Alert.alert('Error', 'No se puede abrir esta URL');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el sitio web');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar Cuenta',
      `¿Estás seguro de que quieres eliminar la cuenta de ${account.siteName}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(account.id)
        }
      ]
    );
  };

  const strength = getPasswordStrength();
  const categoryColor = getCategoryColor(account.category);

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setShowDetails(true)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.siteInfo}>
            <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '20' }]}>
              <Ionicons 
                name={getCategoryIcon(account.category) as any} 
                size={24} 
                color={categoryColor} 
              />
            </View>
            <View style={styles.siteDetails}>
              <Text style={styles.siteName} numberOfLines={1}>
                {account.siteName}
              </Text>
              {account.username && (
                <Text style={styles.username} numberOfLines={1}>
                  {account.username}
                </Text>
              )}
              {account.email && (
                <Text style={styles.email} numberOfLines={1}>
                  {account.email}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.cardActions}>
            <View style={[styles.strengthBadge, { backgroundColor: strength.color }]}>
              <Text style={styles.strengthText}>{strength.level}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.metaInfo}>
            <Ionicons name="time" size={12} color="#666" />
            <Text style={styles.metaText}>
              {account.lastUsed 
                ? `Usado: ${account.lastUsed.toLocaleDateString()}`
                : `Creado: ${account.createdAt.toLocaleDateString()}`
              }
            </Text>
          </View>

          {account.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {account.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {account.tags.length > 2 && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>+{account.tags.length - 2}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Modal de detalles */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowDetails(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{account.siteName}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={() => {
                  setShowDetails(false);
                  onEdit(account);
                }} 
                style={styles.editButton}
              >
                <Ionicons name="pencil" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} style={styles.deleteButton}>
                <Ionicons name="trash" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Información básica */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Básica</Text>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Sitio</Text>
                <View style={styles.detailValue}>
                  <Text style={styles.detailText}>{account.siteName}</Text>
                  {account.siteUrl && (
                    <TouchableOpacity onPress={openWebsite} style={styles.actionButton}>
                      <Ionicons name="open-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {account.siteUrl && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>URL</Text>
                  <View style={styles.detailValue}>
                    <Text style={styles.detailText} numberOfLines={1}>
                      {account.siteUrl}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(account.siteUrl!, 'URL')}
                      style={styles.actionButton}
                    >
                      <Ionicons name="copy-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Categoría</Text>
                <View style={styles.categoryInfo}>
                  <Ionicons 
                    name={getCategoryIcon(account.category) as any} 
                    size={20} 
                    color={categoryColor} 
                  />
                  <Text style={[styles.detailText, { marginLeft: 8 }]}>
                    {account.category}
                  </Text>
                </View>
              </View>
            </View>

            {/* Credenciales */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Credenciales</Text>

              {account.username && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Usuario</Text>
                  <View style={styles.detailValue}>
                    <Text style={styles.detailText}>{account.username}</Text>
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(account.username!, 'Usuario')}
                      style={styles.actionButton}
                    >
                      <Ionicons name="copy-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {account.email && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <View style={styles.detailValue}>
                    <Text style={styles.detailText}>{account.email}</Text>
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(account.email!, 'Email')}
                      style={styles.actionButton}
                    >
                      <Ionicons name="copy-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Contraseña</Text>
                <View style={styles.detailValue}>
                  <Text style={[styles.detailText, styles.passwordText]}>
                    {showPassword ? account.password : '•'.repeat(account.password.length)}
                  </Text>
                  <View style={styles.passwordActions}>
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.actionButton}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(account.password, 'Contraseña')}
                      style={styles.actionButton}
                    >
                      <Ionicons name="copy-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.strengthInfo}>
                <View style={[styles.strengthBadge, { backgroundColor: strength.color }]}>
                  <Text style={styles.strengthText}>{strength.level}</Text>
                </View>
                <Text style={styles.strengthDetails}>
                  {account.password.length} caracteres • 
                  {account.options.includeNumbers ? ' Números' : ''} •
                  {account.options.includeSymbols ? ' Símbolos' : ''}
                </Text>
              </View>
            </View>

            {/* Etiquetas y notas */}
            {(account.tags.length > 0 || account.notes) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información Adicional</Text>

                {account.tags.length > 0 && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Etiquetas</Text>
                    <View style={styles.tagsGrid}>
                      {account.tags.map((tag, index) => (
                        <View key={index} style={styles.detailTag}>
                          <Text style={styles.detailTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {account.notes && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Notas</Text>
                    <Text style={styles.notesText}>{account.notes}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Información técnica */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información del Sistema</Text>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Creado</Text>
                <Text style={styles.detailText}>
                  {account.createdAt.toLocaleDateString()} a las {account.createdAt.toLocaleTimeString()}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Modificado</Text>
                <Text style={styles.detailText}>
                  {account.lastModified.toLocaleDateString()} a las {account.lastModified.toLocaleTimeString()}
                </Text>
              </View>

              {account.lastUsed && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Último Uso</Text>
                  <Text style={styles.detailText}>
                    {account.lastUsed.toLocaleDateString()} a las {account.lastUsed.toLocaleTimeString()}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  siteInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  siteDetails: {
    flex: 1,
  },
  siteName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 1,
  },
  email: {
    fontSize: 14,
    color: '#007AFF',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#666',
  },
  strengthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  strengthText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  passwordText: {
    fontFamily: 'monospace',
  },
  passwordActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthDetails: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailTag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  detailTagText: {
    color: '#007AFF',
    fontSize: 14,
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    padding: 8,
    marginRight: 8,
  },
});
