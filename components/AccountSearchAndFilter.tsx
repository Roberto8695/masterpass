import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatabasePassword } from '@/hooks/useDatabase';

interface AccountSearchAndFilterProps {
  accounts: DatabasePassword[];
  onFilteredAccountsChange: (filtered: DatabasePassword[]) => void;
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Todos',
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

const SORT_OPTIONS = [
  { key: 'name', label: 'Nombre (A-Z)' },
  { key: 'name_desc', label: 'Nombre (Z-A)' },
  { key: 'created_desc', label: 'Más recientes' },
  { key: 'created_asc', label: 'Más antiguos' },
  { key: 'used_desc', label: 'Usados recientemente' },
  { key: 'category', label: 'Por categoría' },
];

export default function AccountSearchAndFilter({
  accounts,
  onFilteredAccountsChange,
  visible,
  onClose
}: AccountSearchAndFilterProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedSort, setSelectedSort] = useState('created_desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Obtener todas las etiquetas únicas
  const getAllTags = (): string[] => {
    const tagSet = new Set<string>();
    accounts.forEach(account => {
      account.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  const applyFilters = () => {
    let filtered = [...accounts];

    // Filtro por texto de búsqueda
    if (searchText.trim()) {
      const search = searchText.toLowerCase().trim();
      filtered = filtered.filter(account =>
        account.siteName.toLowerCase().includes(search) ||
        account.siteUrl?.toLowerCase().includes(search) ||
        account.username?.toLowerCase().includes(search) ||
        account.email?.toLowerCase().includes(search) ||
        account.notes?.toLowerCase().includes(search) ||
        account.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Filtro por categoría
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(account => account.category === selectedCategory);
    }

    // Filtro por etiquetas
    if (selectedTags.length > 0) {
      filtered = filtered.filter(account =>
        selectedTags.every(tag => account.tags.includes(tag))
      );
    }

    // Ordenamiento
    switch (selectedSort) {
      case 'name':
        filtered.sort((a, b) => a.siteName.localeCompare(b.siteName));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.siteName.localeCompare(a.siteName));
        break;
      case 'created_desc':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'created_asc':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'used_desc':
        filtered.sort((a, b) => {
          const aTime = a.lastUsed?.getTime() || 0;
          const bTime = b.lastUsed?.getTime() || 0;
          return bTime - aTime;
        });
        break;
      case 'category':
        filtered.sort((a, b) => {
          if (a.category === b.category) {
            return a.siteName.localeCompare(b.siteName);
          }
          return a.category.localeCompare(b.category);
        });
        break;
    }

    onFilteredAccountsChange(filtered);
    onClose();
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('Todos');
    setSelectedSort('created_desc');
    setSelectedTags([]);
    onFilteredAccountsChange(accounts);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getCategoryCount = (category: string): number => {
    if (category === 'Todos') return accounts.length;
    return accounts.filter(account => account.category === category).length;
  };

  const getTagCount = (tag: string): number => {
    return accounts.filter(account => account.tags.includes(tag)).length;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Buscar y Filtrar</Text>
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Barra de búsqueda */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Búsqueda</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Buscar por nombre, URL, email, usuario o etiquetas..."
                placeholderTextColor="#999"
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText('')}
                  style={styles.clearSearchButton}
                >
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filtro por categoría */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categoría</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category && styles.categoryItemSelected
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextSelected
                  ]}>
                    {category}
                  </Text>
                  <View style={styles.categoryCount}>
                    <Text style={styles.categoryCountText}>
                      {getCategoryCount(category)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtro por etiquetas */}
          {getAllTags().length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Etiquetas</Text>
              <View style={styles.tagsContainer}>
                {getAllTags().map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagItem,
                      selectedTags.includes(tag) && styles.tagItemSelected
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[
                      styles.tagText,
                      selectedTags.includes(tag) && styles.tagTextSelected
                    ]}>
                      {tag}
                    </Text>
                    <View style={styles.tagCount}>
                      <Text style={styles.tagCountText}>
                        {getTagCount(tag)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Ordenamiento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ordenar por</Text>
            <View style={styles.sortContainer}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortItem,
                    selectedSort === option.key && styles.sortItemSelected
                  ]}
                  onPress={() => setSelectedSort(option.key)}
                >
                  <View style={styles.sortRadio}>
                    {selectedSort === option.key && (
                      <View style={styles.sortRadioSelected} />
                    )}
                  </View>
                  <Text style={[
                    styles.sortText,
                    selectedSort === option.key && styles.sortTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Resumen de filtros activos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filtros Activos</Text>
            <View style={styles.activeFilters}>
              {searchText && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>
                    Búsqueda: "{searchText}"
                  </Text>
                </View>
              )}
              {selectedCategory !== 'Todos' && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>
                    Categoría: {selectedCategory}
                  </Text>
                </View>
              )}
              {selectedTags.map((tag) => (
                <View key={tag} style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>
                    Etiqueta: {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={applyFilters} style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  clearSearchButton: {
    padding: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  categoryItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    margin: 6,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryItemSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryTextSelected: {
    color: 'white',
  },
  categoryCount: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryCountText: {
    fontSize: 12,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tagItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tagItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  tagText: {
    fontSize: 14,
    color: '#333',
    marginRight: 6,
  },
  tagTextSelected: {
    color: '#007AFF',
  },
  tagCount: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  tagCountText: {
    fontSize: 10,
    color: '#666',
  },
  sortContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortItemSelected: {
    backgroundColor: '#f8f9ff',
  },
  sortRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  sortText: {
    fontSize: 16,
    color: '#333',
  },
  sortTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  activeFilter: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#007AFF',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
