import * as SQLite from 'expo-sqlite';
import { encryptionService } from './EncryptionService';

// Interfaces para los tipos de datos
export interface DatabasePasswordEntry {
  id: string;
  siteName: string;
  siteUrl?: string;
  username?: string;
  email?: string;
  password: string;
  category: string;
  tags: string;
  notes?: string;
  favicon?: string;
  options: string; // JSON encriptado de PasswordOptions
  createdAt: number;
  lastModified: number;
  lastUsed?: number;
  isDeleted: boolean;
}

export interface PasswordOptions {
  length: number;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar?: boolean;
  excludeAmbiguous?: boolean;
  startWithLetter?: boolean;
  noRepeatingChars?: boolean;
}

export class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  private isInitializing = false;

  // Singleton pattern
  private static instance: DatabaseService;
  
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private constructor() {}

  /**
   * Inicializar la base de datos y crear las tablas
   */
  async initialize(): Promise<void> {
    // Evitar múltiples inicializaciones
    if (this.isInitialized) {
      console.log('📋 Base de datos ya inicializada');
      return;
    }
    
    if (this.isInitializing) {
      console.log('⏳ Inicialización ya en progreso...');
      return;
    }

    this.isInitializing = true;

    try {
      console.log('🔧 Inicializando base de datos SQLite...');
      
      // Primero inicializar el servicio de encriptación
      console.log('🔐 Inicializando servicio de encriptación...');
      try {
        await encryptionService.initialize();
        console.log('✅ Servicio de encriptación inicializado correctamente');
      } catch (encryptionError) {
        console.error('❌ Error específico en encriptación:', encryptionError);
        throw encryptionError;
      }
      
      // Abrir la base de datos encriptada
      this.db = await SQLite.openDatabaseAsync('masterpass_vault.db');
      
      // Crear tabla de contraseñas si no existe
      await this.createTables();
      
      this.isInitialized = true;
      console.log('✅ Base de datos SQLite inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error);
      throw new Error('No se pudo inicializar la base de datos');
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Crear las tablas necesarias
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Base de datos no inicializada');

    const createPasswordsTable = `
      CREATE TABLE IF NOT EXISTS passwords (
        id TEXT PRIMARY KEY NOT NULL,
        siteName TEXT NOT NULL,
        siteUrl TEXT,
        username TEXT,
        email TEXT,
        password TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        tags TEXT DEFAULT '',
        notes TEXT,
        favicon TEXT,
        options TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        lastModified INTEGER NOT NULL,
        lastUsed INTEGER,
        isDeleted INTEGER DEFAULT 0
      );
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_passwords_siteName ON passwords(siteName);
      CREATE INDEX IF NOT EXISTS idx_passwords_category ON passwords(category);
      CREATE INDEX IF NOT EXISTS idx_passwords_createdAt ON passwords(createdAt);
      CREATE INDEX IF NOT EXISTS idx_passwords_isDeleted ON passwords(isDeleted);
    `;

    try {
      await this.db.execAsync(createPasswordsTable);
      await this.db.execAsync(createIndexes);
      console.log('✅ Tablas creadas correctamente');
    } catch (error) {
      console.error('❌ Error creando tablas:', error);
      throw error;
    }
  }

  /**
   * Verificar si la base de datos está lista
   */
  isReady(): boolean {
    return this.isInitialized && this.db !== null && encryptionService.isReady();
  }

  /**
   * Guardar una nueva contraseña encriptada
   */
  async savePassword(
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
  ): Promise<string> {
    if (!this.isReady()) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      const id = `pwd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();

      // Encriptar la contraseña y las opciones
      const encryptedPassword = await encryptionService.encrypt(password);
      const encryptedOptions = await encryptionService.encrypt(JSON.stringify(options));

      // Convertir datos encriptados a string para almacenamiento
      const encryptedPasswordStr = JSON.stringify(encryptedPassword);
      const encryptedOptionsStr = JSON.stringify(encryptedOptions);

      const insertQuery = `
        INSERT INTO passwords (
          id, siteName, siteUrl, username, email, password, 
          category, tags, notes, favicon, options, 
          createdAt, lastModified, isDeleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `;

      const params = [
        id,
        siteName,
        additionalData?.siteUrl || null,
        additionalData?.username || null,
        additionalData?.email || null,
        encryptedPasswordStr,
        additionalData?.category || 'General',
        JSON.stringify(additionalData?.tags || []),
        additionalData?.notes || null,
        null, // favicon - lo implementaremos más tarde
        encryptedOptionsStr,
        now,
        now
      ];

      await this.db!.runAsync(insertQuery, params);
      
      console.log(`✅ Contraseña guardada en BD encriptada: ${id}`);
      return id;
    } catch (error) {
      console.error('❌ Error guardando contraseña en BD:', error);
      throw new Error('No se pudo guardar la contraseña en la base de datos');
    }
  }

  /**
   * Cargar todas las contraseñas desencriptadas
   */
  async loadPasswords(): Promise<Array<{
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
  }>> {
    if (!this.isReady()) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      const query = `
        SELECT * FROM passwords 
        WHERE isDeleted = 0 
        ORDER BY createdAt DESC
      `;

      const result = await this.db!.getAllAsync(query) as DatabasePasswordEntry[];
      
      // Desencriptar y formatear los resultados
      const decryptedPasswords = await Promise.all(
        result.map(async (row) => {
          try {
            // Convertir strings de BD de vuelta a EncryptedData
            const encryptedPasswordData = JSON.parse(row.password);
            const encryptedOptionsData = JSON.parse(row.options);
            
            const decryptedPassword = await encryptionService.decrypt(encryptedPasswordData);
            const decryptedOptions = JSON.parse(
              await encryptionService.decrypt(encryptedOptionsData)
            ) as PasswordOptions;

            return {
              id: row.id,
              siteName: row.siteName,
              siteUrl: row.siteUrl || undefined,
              username: row.username || undefined,
              email: row.email || undefined,
              password: decryptedPassword,
              category: row.category,
              tags: JSON.parse(row.tags || '[]'),
              notes: row.notes || undefined,
              options: decryptedOptions,
              createdAt: new Date(row.createdAt),
              lastModified: new Date(row.lastModified),
              lastUsed: row.lastUsed ? new Date(row.lastUsed) : undefined,
            };
          } catch (decryptError) {
            console.error(`❌ Error desencriptando contraseña ${row.id}:`, decryptError);
            // Retornar entrada con error para debugging
            return null;
          }
        })
      );

      // Filtrar entradas nulas (errores de desencriptación)
      const validPasswords = decryptedPasswords.filter(p => p !== null);
      
      console.log(`✅ Cargadas ${validPasswords.length} contraseñas de la BD`);
      return validPasswords as any;
    } catch (error) {
      console.error('❌ Error cargando contraseñas de BD:', error);
      throw new Error('No se pudieron cargar las contraseñas de la base de datos');
    }
  }

  /**
   * Eliminar una contraseña (soft delete)
   */
  async deletePassword(id: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      const updateQuery = `
        UPDATE passwords 
        SET isDeleted = 1, lastModified = ? 
        WHERE id = ?
      `;

      await this.db!.runAsync(updateQuery, [Date.now(), id]);
      console.log(`✅ Contraseña marcada como eliminada: ${id}`);
    } catch (error) {
      console.error('❌ Error eliminando contraseña de BD:', error);
      throw new Error('No se pudo eliminar la contraseña de la base de datos');
    }
  }

  /**
   * Actualizar última vez usada
   */
  async updateLastUsed(id: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      const updateQuery = `
        UPDATE passwords 
        SET lastUsed = ?, lastModified = ? 
        WHERE id = ?
      `;

      const now = Date.now();
      await this.db!.runAsync(updateQuery, [now, now, id]);
    } catch (error) {
      console.error('❌ Error actualizando última vez usado:', error);
    }
  }

  /**
   * Buscar contraseñas por sitio
   */
  async searchBySite(siteName: string): Promise<Array<any>> {
    if (!this.isReady()) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      const query = `
        SELECT * FROM passwords 
        WHERE siteName LIKE ? AND isDeleted = 0 
        ORDER BY lastUsed DESC, createdAt DESC
      `;

      const result = await this.db!.getAllAsync(query, [`%${siteName}%`]) as DatabasePasswordEntry[];
      
      // Desencriptar resultados
      const decryptedResults = await Promise.all(
        result.map(async (row) => {
          // Convertir strings de BD de vuelta a EncryptedData
          const encryptedPasswordData = JSON.parse(row.password);
          const encryptedOptionsData = JSON.parse(row.options);
          
          const decryptedPassword = await encryptionService.decrypt(encryptedPasswordData);
          const decryptedOptions = JSON.parse(
            await encryptionService.decrypt(encryptedOptionsData)
          );

          return {
            id: row.id,
            siteName: row.siteName,
            password: decryptedPassword,
            options: decryptedOptions,
            createdAt: new Date(row.createdAt),
            lastUsed: row.lastUsed ? new Date(row.lastUsed) : undefined,
          };
        })
      );

      return decryptedResults;
    } catch (error) {
      console.error('❌ Error buscando por sitio:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  async getStatistics(): Promise<{
    totalPasswords: number;
    categoryCounts: Record<string, number>;
    weakPasswords: number;
    reusedPasswords: number;
    oldestPassword?: Date;
    newestPassword?: Date;
  }> {
    if (!this.isReady()) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      // Contar total de contraseñas
      const totalQuery = `SELECT COUNT(*) as count FROM passwords WHERE isDeleted = 0`;
      const totalResult = await this.db!.getFirstAsync(totalQuery) as { count: number };

      // Contar por categorías
      const categoryQuery = `
        SELECT category, COUNT(*) as count 
        FROM passwords 
        WHERE isDeleted = 0 
        GROUP BY category
      `;
      const categoryResult = await this.db!.getAllAsync(categoryQuery) as Array<{ category: string; count: number }>;

      // Fechas extremas
      const datesQuery = `
        SELECT MIN(createdAt) as oldest, MAX(createdAt) as newest 
        FROM passwords 
        WHERE isDeleted = 0
      `;
      const datesResult = await this.db!.getFirstAsync(datesQuery) as { oldest: number; newest: number };

      const categoryCounts: Record<string, number> = {};
      categoryResult.forEach(cat => {
        categoryCounts[cat.category] = cat.count;
      });

      return {
        totalPasswords: totalResult.count,
        categoryCounts,
        weakPasswords: 0, // Implementaremos análisis de debilidad
        reusedPasswords: 0, // Implementaremos análisis de reutilización
        oldestPassword: datesResult.oldest ? new Date(datesResult.oldest) : undefined,
        newestPassword: datesResult.newest ? new Date(datesResult.newest) : undefined,
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Exportar todas las contraseñas (para backup)
   */
  async exportAll(): Promise<string> {
    if (!this.isReady()) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      const passwords = await this.loadPasswords();
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        passwords: passwords.map(p => ({
          siteName: p.siteName,
          siteUrl: p.siteUrl,
          username: p.username,
          email: p.email,
          password: p.password,
          category: p.category,
          tags: p.tags,
          notes: p.notes,
          options: p.options,
          createdAt: p.createdAt.toISOString(),
        }))
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Error exportando datos:', error);
      throw error;
    }
  }

  /**
   * Limpiar toda la base de datos
   */
  async clearAll(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      await this.db!.runAsync('DELETE FROM passwords');
      console.log('✅ Base de datos limpiada completamente');
    } catch (error) {
      console.error('❌ Error limpiando base de datos:', error);
      throw error;
    }
  }

  /**
   * Cerrar la conexión a la base de datos
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log('✅ Conexión a base de datos cerrada');
    }
  }
}

// Exportar instancia singleton
export const databaseService = DatabaseService.getInstance();
