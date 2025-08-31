import { databaseService } from './DatabaseService';
import { securePasswordStorage } from './SecurePasswordStorage';
import * as SecureStore from 'expo-secure-store';

export class MigrationService {
  private static instance: MigrationService;
  
  public static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  private constructor() {}

  /**
   * Verificar si ya se ejecutó la migración
   */
  async checkMigrationStatus(): Promise<boolean> {
    try {
      const migrationFlag = await SecureStore.getItemAsync('migration_completed');
      return migrationFlag === 'true';
    } catch (error) {
      console.log('🔄 Primera vez ejecutando migración');
      return false;
    }
  }

  /**
   * Migrar datos de SecureStore a SQLite
   */
  async migrateToDatabase(): Promise<{
    success: boolean;
    migratedCount: number;
    errors: string[];
  }> {
    const results = {
      success: false,
      migratedCount: 0,
      errors: [] as string[]
    };

    try {
      console.log('🔄 Iniciando migración de SecureStore a SQLite...');

      // Verificar si ya se migró
      const alreadyMigrated = await this.checkMigrationStatus();
      if (alreadyMigrated) {
        console.log('✅ Migración ya completada anteriormente');
        results.success = true;
        return results;
      }

      // Asegurar que la base de datos esté inicializada
      if (!databaseService.isReady()) {
        await databaseService.initialize();
      }

      // Cargar datos existentes del SecureStore
      let existingPasswords: any[] = [];
      try {
        existingPasswords = await securePasswordStorage.loadPasswords();
        console.log(`📦 Encontradas ${existingPasswords.length} contraseñas en SecureStore`);
      } catch (error) {
        console.log('📦 No hay datos existentes en SecureStore o error al cargar');
        results.success = true;
        await this.markMigrationComplete();
        return results;
      }

      // Migrar cada contraseña
      for (const password of existingPasswords) {
        try {
          await databaseService.savePassword(
            password.password,
            password.options,
            password.website || 'Contraseña General',
            {
              category: 'Migradas',
              tags: ['migración-inicial']
            }
          );
          results.migratedCount++;
          console.log(`✅ Migrada contraseña: ${password.website || 'General'}`);
        } catch (error) {
          const errorMsg = `Error migrando contraseña ${password.id}: ${error}`;
          console.error(`❌ ${errorMsg}`);
          results.errors.push(errorMsg);
        }
      }

      // Marcar migración como completada
      await this.markMigrationComplete();
      
      console.log(`✅ Migración completada: ${results.migratedCount} contraseñas migradas`);
      results.success = true;

      // Opcional: Limpiar datos antiguos después de migración exitosa
      if (results.migratedCount > 0 && results.errors.length === 0) {
        await this.cleanupOldData();
      }

    } catch (error) {
      const errorMsg = `Error general en migración: ${error}`;
      console.error(`❌ ${errorMsg}`);
      results.errors.push(errorMsg);
    }

    return results;
  }

  /**
   * Marcar migración como completada
   */
  private async markMigrationComplete(): Promise<void> {
    try {
      await SecureStore.setItemAsync('migration_completed', 'true');
      await SecureStore.setItemAsync('migration_date', new Date().toISOString());
      console.log('✅ Migración marcada como completada');
    } catch (error) {
      console.error('❌ Error marcando migración como completada:', error);
    }
  }

  /**
   * Limpiar datos antiguos de SecureStore (opcional)
   */
  private async cleanupOldData(): Promise<void> {
    try {
      console.log('🧹 Limpiando datos antiguos de SecureStore...');
      
      // Lista de claves que usaba el sistema anterior
      const oldKeys = [
        'passwordHistory',
        'vault_data',
        'encrypted_passwords'
      ];

      for (const key of oldKeys) {
        try {
          await SecureStore.deleteItemAsync(key);
          console.log(`✅ Eliminada clave antigua: ${key}`);
        } catch (error) {
          console.log(`ℹ️ Clave ${key} no existía o ya fue eliminada`);
        }
      }

      console.log('✅ Limpieza de datos antiguos completada');
    } catch (error) {
      console.error('❌ Error en limpieza de datos antiguos:', error);
    }
  }

  /**
   * Verificar integridad de la migración
   */
  async verifyMigration(): Promise<{
    isValid: boolean;
    issues: string[];
    stats: {
      totalInDatabase: number;
      oldestEntry?: Date;
      newestEntry?: Date;
    };
  }> {
    const verification = {
      isValid: true,
      issues: [] as string[],
      stats: {
        totalInDatabase: 0,
        oldestEntry: undefined as Date | undefined,
        newestEntry: undefined as Date | undefined
      }
    };

    try {
      // Verificar que la base de datos está funcionando
      if (!databaseService.isReady()) {
        await databaseService.initialize();
      }

      // Obtener estadísticas
      const stats = await databaseService.getStatistics();
      verification.stats.totalInDatabase = stats.totalPasswords;
      verification.stats.oldestEntry = stats.oldestPassword;
      verification.stats.newestEntry = stats.newestPassword;

      // Verificar que se pueden cargar las contraseñas
      const passwords = await databaseService.loadPasswords();
      
      if (passwords.length !== stats.totalPasswords) {
        verification.isValid = false;
        verification.issues.push('Inconsistencia en conteo de contraseñas');
      }

      // Verificar que todas las contraseñas se pueden desencriptar
      for (const password of passwords.slice(0, 5)) { // Verificar solo las primeras 5
        if (!password.password || password.password.length === 0) {
          verification.isValid = false;
          verification.issues.push(`Contraseña vacía encontrada: ${password.id}`);
        }
      }

      console.log(`✅ Verificación completada: ${verification.stats.totalInDatabase} contraseñas en BD`);

    } catch (error) {
      verification.isValid = false;
      verification.issues.push(`Error en verificación: ${error}`);
      console.error('❌ Error en verificación de migración:', error);
    }

    return verification;
  }

  /**
   * Forzar re-migración (solo para desarrollo/debugging)
   */
  async forceMigration(): Promise<void> {
    try {
      console.log('🔄 Forzando re-migración...');
      
      // Eliminar flag de migración
      await SecureStore.deleteItemAsync('migration_completed');
      await SecureStore.deleteItemAsync('migration_date');
      
      // Limpiar base de datos
      if (databaseService.isReady()) {
        await databaseService.clearAll();
      }
      
      console.log('✅ Sistema preparado para re-migración');
    } catch (error) {
      console.error('❌ Error forzando migración:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const migrationService = MigrationService.getInstance();
