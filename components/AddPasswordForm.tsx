import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '@/hooks/useDatabase';

interface AddPasswordFormProps {
  visible: boolean;
  onClose: () => void;
  onPasswordAdded: () => void;
  initialPassword?: string;
}

export interface AccountFormData {
  siteName: string;
  siteUrl: string;
  username: string;
  email: string;
  password: string;
  category: string;
  notes: string;
  tags: string[];
}

const CATEGORIES = [
  'Redes Sociales',
  'Bancos',
  'Trabajo',
  'Entretenimiento',
  'Compras',
  'Email',
  'Desarrollo',
  'Educación',
  'Salud',
  'Gobierno',
  'General'
];

export default function AddPasswordForm({ 
  visible, 
  onClose, 
  onPasswordAdded, 
  initialPassword = '' 
}: AddPasswordFormProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    siteName: '',
    siteUrl: '',
    username: '',
    email: '',
    password: initialPassword,
    category: 'General',
    notes: '',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const { savePassword, isReady } = useDatabase();

  const resetForm = () => {
    setFormData({
      siteName: '',
      siteUrl: '',
      username: '',
      email: '',
      password: initialPassword,
      category: 'General',
      notes: '',
      tags: []
    });
    setTagInput('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): string | null => {
    if (!formData.siteName.trim()) {
      return 'El nombre del sitio es obligatorio';
    }
    
    if (!formData.password.trim()) {
      return 'La contraseña es obligatoria';
    }

    if (formData.password.length < 15) {
      return 'La contraseña debe tener al menos 15 caracteres';
    }

    if (formData.siteUrl && !isValidUrl(formData.siteUrl)) {
      return 'La URL del sitio no es válida';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      return 'El email no es válido';
    }

    return null;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!isReady) {
      Alert.alert('Error', 'La base de datos no está lista');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Error de validación', validationError);
      return;
    }

    setIsLoading(true);
    
    try {
      // Generar opciones de contraseña basadas en el contenido
      const passwordOptions = {
        length: formData.password.length,
        includeNumbers: /\d/.test(formData.password),
        includeSymbols: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
      };

      // Preparar datos adicionales
      const additionalData = {
        siteUrl: formData.siteUrl || undefined,
        username: formData.username || undefined,
        email: formData.email || undefined,
        category: formData.category,
        tags: formData.tags,
        notes: formData.notes || undefined
      };

      const passwordId = await savePassword(
        formData.password,
        passwordOptions,
        formData.siteName,
        additionalData
      );

      if (passwordId) {
        Alert.alert(
          'Cuenta Guardada',
          `La cuenta para ${formData.siteName} ha sido guardada de forma segura.`,
          [
            {
              text: 'OK',
              onPress: () => {
                handleClose();
                onPasswordAdded();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'No se pudo guardar la cuenta');
      }
    } catch (error) {
      console.error('❌ Error guardando cuenta:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Nueva Cuenta</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Sitio *</Text>
              <TextInput
                style={styles.input}
                value={formData.siteName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, siteName: text }))}
                placeholder="Ej: Gmail, Facebook, GitHub"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL del Sitio</Text>
              <TextInput
                style={styles.input}
                value={formData.siteUrl}
                onChangeText={(text) => setFormData(prev => ({ ...prev, siteUrl: text }))}
                placeholder="https://ejemplo.com"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </View>

          {/* Credenciales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Credenciales</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Usuario/Nombre de Usuario</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                placeholder="Nombre de usuario"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="usuario@ejemplo.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña *</Text>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                placeholder="Contraseña segura"
                secureTextEntry
                multiline
              />
              <Text style={styles.passwordInfo}>
                Longitud: {formData.password.length} caracteres
                {formData.password.length < 15 && (
                  <Text style={styles.passwordWarning}> (Mínimo 15)</Text>
                )}
              </Text>
            </View>
          </View>

          {/* Organización */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organización</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoría</Text>
              <TouchableOpacity
                style={styles.categoryPicker}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={styles.categoryText}>{formData.category}</Text>
                <Ionicons 
                  name={showCategoryPicker ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              
              {showCategoryPicker && (
                <View style={styles.categoryList}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryItem,
                        formData.category === category && styles.categoryItemSelected
                      ]}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, category }));
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.categoryItemText,
                        formData.category === category && styles.categoryItemTextSelected
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Etiquetas</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Agregar etiqueta"
                  autoCapitalize="none"
                  onSubmitEditing={addTag}
                />
                <TouchableOpacity onPress={addTag} style={styles.addTagButton}>
                  <Ionicons name="add" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
              
              {formData.tags.length > 0 && (
                <View style={styles.tagsList}>
                  {formData.tags.map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.tag}
                      onPress={() => removeTag(tag)}
                    >
                      <Text style={styles.tagText}>{tag}</Text>
                      <Ionicons name="close" size={16} color="#666" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notas</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Notas adicionales sobre esta cuenta..."
                multiline
                numberOfLines={3}
              />
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
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  passwordInput: {
    minHeight: 40,
  },
  passwordInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  passwordWarning: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  categoryPicker: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  categoryList: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
  },
  categoryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
  categoryItemTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: '#007AFF',
    fontSize: 14,
    marginRight: 4,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
