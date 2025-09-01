import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatabasePassword, useDatabase } from '../hooks/useDatabase';
import { PasswordOptions } from '../services/DatabaseService';

interface EditPasswordFormProps {
  password: DatabasePassword;
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditPasswordForm({ password, visible, onClose, onUpdate }: EditPasswordFormProps) {
  const { updatePassword } = useDatabase();
  
  // Estados del formulario
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);

  // Categorías disponibles
  const categories = [
    'General', 'Redes Sociales', 'Bancos', 'Trabajo', 
    'Entretenimiento', 'Compras', 'Email', 'Desarrollo'
  ];

  // Cargar datos del password cuando se abre el modal
  useEffect(() => {
    if (visible && password) {
      setSiteName(password.siteName);
      setSiteUrl(password.siteUrl || '');
      setUsername(password.username || '');
      setEmail(password.email || '');
      setCurrentPassword(password.password);
      setCategory(password.category);
      setTags(Array.isArray(password.tags) ? password.tags.join(', ') : '');
      setNotes(password.notes || '');
    }
  }, [visible, password]);

  const generateNewPassword = () => {
    // Función simple para generar contraseña aleatoria
    const generateRandomPassword = (length: number = 16): string => {
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      const allChars = lowercase + uppercase + numbers + symbols;
      let password = '';
      
      // Asegurar al menos un carácter de cada tipo
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += symbols[Math.floor(Math.random() * symbols.length)];
      
      // Completar el resto de la longitud
      for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }
      
      // Mezclar los caracteres
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    // Usar la longitud de la contraseña actual, mínimo 8 caracteres
    const currentLength = Math.max(currentPassword.length, 8);

    Alert.alert(
      '🔐 Generar Nueva Contraseña',
      `¿Quieres generar una nueva contraseña segura de ${currentLength} caracteres? Esto reemplazará la contraseña actual.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Generar', 
          onPress: () => {
            const newPassword = generateRandomPassword(currentLength);
            setCurrentPassword(newPassword);
            setShowPassword(true); // Mostrar la nueva contraseña generada
            Alert.alert('✅ Nueva Contraseña', `Nueva contraseña de ${currentLength} caracteres generada. Asegúrate de guardar los cambios.`);
          }
        }
      ]
    );
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 'Sin contraseña', color: '#999', score: 0 };
    
    let score = 0;
    
    // Longitud
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (pass.length >= 16) score += 1;
    
    // Complejidad
    if (/[a-z]/.test(pass)) score += 1; // minúsculas
    if (/[A-Z]/.test(pass)) score += 1; // mayúsculas
    if (/[0-9]/.test(pass)) score += 1; // números
    if (/[^A-Za-z0-9]/.test(pass)) score += 1; // símbolos
    
    if (score <= 2) return { strength: 'Débil', color: '#FF3B30', score };
    if (score <= 4) return { strength: 'Moderada', color: '#FF9500', score };
    if (score <= 6) return { strength: 'Fuerte', color: '#4CAF50', score };
    return { strength: 'Muy Fuerte', color: '#2E7D32', score };
  };

  const passwordStrength = getPasswordStrength(currentPassword);

  const handleUpdate = async () => {
    if (!siteName.trim()) {
      Alert.alert('Error', 'El nombre del sitio es obligatorio');
      return;
    }

    setIsUpdating(true);
    try {
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Crear nuevas opciones basadas en la contraseña actual
      const updatedOptions = {
        ...password.options,
        length: currentPassword.length
      };

      const success = await updatePassword(
        password.id,
        currentPassword,
        updatedOptions, // Usar las opciones actualizadas con la nueva longitud
        siteName.trim(),
        {
          siteUrl: siteUrl.trim() || undefined,
          username: username.trim() || undefined,
          email: email.trim() || undefined,
          category,
          tags: tagsArray,
          notes: notes.trim() || undefined,
        }
      );

      if (success) {
        Alert.alert('✅ Éxito', 'Cuenta actualizada correctamente', [
          { text: 'OK', onPress: () => {
            onUpdate();
            onClose();
          }}
        ]);
      } else {
        Alert.alert('❌ Error', 'No se pudo actualizar la cuenta');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Error inesperado al actualizar la cuenta');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Edición',
      '¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.',
      [
        { text: 'Continuar editando', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: onClose }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color="#FF3B30" />
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Editar Cuenta</Text>
          
          <TouchableOpacity 
            onPress={handleUpdate} 
            style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
            disabled={isUpdating}
          >
            <Ionicons 
              name={isUpdating ? "hourglass-outline" : "checkmark"} 
              size={24} 
              color={isUpdating ? "#999" : "#4CAF50"} 
            />
            <Text style={[styles.saveText, isUpdating && styles.saveTextDisabled]}>
              {isUpdating ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Información Básica</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Sitio *</Text>
              <TextInput
                style={styles.input}
                value={siteName}
                onChangeText={setSiteName}
                placeholder="Ej: GitHub, Gmail, Facebook..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL del Sitio</Text>
              <TextInput
                style={styles.input}
                value={siteUrl}
                onChangeText={setSiteUrl}
                placeholder="https://ejemplo.com"
                placeholderTextColor="#999"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Credenciales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔐 Credenciales</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Usuario</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Nombre de usuario"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>Contraseña</Text>
                <TouchableOpacity 
                  style={styles.generateButton}
                  onPress={generateNewPassword}
                >
                  <Ionicons name="refresh" size={16} color="#007AFF" />
                  <Text style={styles.generateButtonText}>Generar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.input, styles.passwordField]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Contraseña actual"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.togglePasswordButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {currentPassword && (
                <View style={styles.strengthIndicator}>
                  <View style={styles.strengthBar}>
                    <View 
                      style={[
                        styles.strengthFill, 
                        { 
                          width: `${(passwordStrength.score / 7) * 100}%`,
                          backgroundColor: passwordStrength.color 
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.strengthInfo}>
                    <Ionicons 
                      name={passwordStrength.score <= 2 ? "shield-outline" : passwordStrength.score <= 4 ? "shield-half" : "shield-checkmark"} 
                      size={16} 
                      color={passwordStrength.color} 
                    />
                    <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.strength}
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.passwordNote}>
                <Ionicons name="information-circle-outline" size={16} color="#666" />
                <Text style={styles.passwordNoteText}>
                  La contraseña se mantiene encriptada en la base de datos
                </Text>
              </View>
            </View>
          </View>

          {/* Organización */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Organización</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipSelected
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextSelected
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Etiquetas</Text>
              <TextInput
                style={styles.input}
                value={tags}
                onChangeText={setTags}
                placeholder="trabajo, personal, importante (separadas por comas)"
                placeholderTextColor="#999"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notas</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Notas adicionales sobre esta cuenta..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Información de la cuenta */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ Información de la Cuenta</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Creada:</Text>
                <Text style={styles.infoValue}>
                  {password.createdAt.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Modificada:</Text>
                <Text style={styles.infoValue}>
                  {password.lastModified.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
              {password.lastUsed && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Último uso:</Text>
                  <Text style={styles.infoValue}>
                    {password.lastUsed.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  saveTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  passwordContainer: {
    marginBottom: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  generateButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  passwordInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordField: {
    flex: 1,
    paddingRight: 50, // Espacio para el botón del ojo
  },
  togglePasswordButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  strengthIndicator: {
    marginTop: 8,
    marginBottom: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  passwordNote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  passwordNoteText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  categoryScroll: {
    marginVertical: 8,
  },
  categoryChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
});
