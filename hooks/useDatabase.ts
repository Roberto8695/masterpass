import { useState, useEffect, useCallback } from 'react';
import { databaseService, PasswordOptions } from '@/services/DatabaseService';
import { migrationService } from '@/services/MigrationService';

export interface DatabasePassword {
  id: string;
  siteName: string;
  siteUrl?: string;
  username?: string;
  email?: string;
  password: string;
  category: string;
  tags: string[];
  notes?: string;
  options: PasswordOptions;
  createdAt: Date;
  lastModified: Date;
  lastUsed?: Date;
}

export interface DatabaseStats {
  totalPasswords: number;
  categoryCounts: Record<string, number>;
  weakPasswords: number;
  reusedPasswords: number;
  oldestPassword?: Date;
  newestPassword?: Date;
}

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [passwords, setPasswords] = useState<DatabasePassword[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Inicializar base de datos y migración
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔧 Inicializando sistema de base de datos...');
      
      // PRIMERO: Inicializar la base de datos (esto también inicializa el servicio de encriptación)
      if (!databaseService.isReady()) {
        await databaseService.initialize();
      }

      // SEGUNDO: Ejecutar migración después de que todo esté listo
      const migrationResult = await migrationService.migrateToDatabase();
      
      if (!migrationResult.success) {
        console.warn('⚠️ Migración con errores:', migrationResult.errors);
      } else {
        console.log(`✅ Migración exitosa: ${migrationResult.migratedCount} contraseñas`);
      }

      setIsReady(true);
      
      // Cargar datos iniciales
      await loadPasswords();
      await loadStats();

      console.log('✅ Sistema de base de datos listo');
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error);
      setError(`Error inicializando base de datos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar todas las contraseñas
  const loadPasswords = useCallback(async () => {
    if (!isReady) return;

    try {
      const loadedPasswords = await databaseService.loadPasswords();
      setPasswords(loadedPasswords);
      console.log(`📦 Cargadas ${loadedPasswords.length} contraseñas de la BD`);
    } catch (error) {
      console.error('❌ Error cargando contraseñas:', error);
      setError(`Error cargando contraseñas: ${error}`);
    }
  }, [isReady]);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    if (!isReady) return;

    try {
      const loadedStats = await databaseService.getStatistics();
      setStats(loadedStats);
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    }
  }, [isReady]);

  // Guardar nueva contraseña
  const savePassword = useCallback(async (
    password: string,
    options: PasswordOptions,
    siteName: string = 'Contraseña General',
    additionalData?: {
      siteUrl?: string;
      username?: string;
      email?: string;
      category?: string;
      tags?: string[];
      notes?: string;
    }
  ): Promise<string | null> => {
    if (!isReady) {
      setError('Base de datos no está lista');
      return null;
    }

    try {
      const id = await databaseService.savePassword(password, options, siteName, additionalData);
      
      // Recargar datos
      await loadPasswords();
      await loadStats();
      
      console.log(`✅ Contraseña guardada: ${siteName}`);
      return id;
    } catch (error) {
      console.error('❌ Error guardando contraseña:', error);
      setError(`Error guardando contraseña: ${error}`);
      return null;
    }
  }, [isReady, loadPasswords, loadStats]);

  // Eliminar contraseña
  const deletePassword = useCallback(async (id: string): Promise<boolean> => {
    if (!isReady) {
      setError('Base de datos no está lista');
      return false;
    }

    try {
      await databaseService.deletePassword(id);
      
      // Recargar datos
      await loadPasswords();
      await loadStats();
      
      console.log(`✅ Contraseña eliminada: ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando contraseña:', error);
      setError(`Error eliminando contraseña: ${error}`);
      return false;
    }
  }, [isReady, loadPasswords, loadStats]);

  // Marcar contraseña como usada
  const markAsUsed = useCallback(async (id: string): Promise<void> => {
    if (!isReady) return;

    try {
      await databaseService.updateLastUsed(id);
      // Actualizar solo la entrada local sin recargar todo
      setPasswords(prev => prev.map(p => 
        p.id === id 
          ? { ...p, lastUsed: new Date() }
          : p
      ));
    } catch (error) {
      console.error('❌ Error marcando como usado:', error);
    }
  }, [isReady]);

  // Buscar por sitio
  const searchBySite = useCallback(async (siteName: string): Promise<DatabasePassword[]> => {
    if (!isReady) return [];

    try {
      const results = await databaseService.searchBySite(siteName);
      return results;
    } catch (error) {
      console.error('❌ Error buscando por sitio:', error);
      setError(`Error en búsqueda: ${error}`);
      return [];
    }
  }, [isReady]);

  // Exportar datos
  const exportData = useCallback(async (): Promise<string | null> => {
    if (!isReady) {
      setError('Base de datos no está lista');
      return null;
    }

    try {
      const exportString = await databaseService.exportAll();
      console.log('✅ Datos exportados exitosamente');
      return exportString;
    } catch (error) {
      console.error('❌ Error exportando datos:', error);
      setError(`Error exportando: ${error}`);
      return null;
    }
  }, [isReady]);

  // Limpiar todo
  const clearAll = useCallback(async (): Promise<boolean> => {
    if (!isReady) {
      setError('Base de datos no está lista');
      return false;
    }

    try {
      await databaseService.clearAll();
      
      // Limpiar estados locales
      setPasswords([]);
      setStats(null);
      
      // Recargar estadísticas
      await loadStats();
      
      console.log('✅ Base de datos limpiada');
      return true;
    } catch (error) {
      console.error('❌ Error limpiando base de datos:', error);
      setError(`Error limpiando: ${error}`);
      return false;
    }
  }, [isReady, loadStats]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Inicializar al montar el hook
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // Estado
    isReady,
    isLoading,
    passwords,
    stats,
    error,
    
    // Acciones
    savePassword,
    deletePassword,
    markAsUsed,
    searchBySite,
    exportData,
    clearAll,
    
    // Utilidades
    loadPasswords,
    loadStats,
    clearError,
    
    // Info
    passwordCount: passwords.length,
    categories: stats?.categoryCounts || {},
  };
}
