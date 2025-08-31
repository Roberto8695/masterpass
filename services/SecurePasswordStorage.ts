import { encryptionService } from './EncryptionService';

/**
 * 🔐 Servicio de Almacenamiento Seguro de Contraseñas
 * 
 * Reemplaza AsyncStorage con almacenamiento encriptado seguro
 * Todas las contraseñas se encriptan antes de guardarse
 */

const SECURE_VAULT_KEY = 'masterpass_secure_vault';

export interface PasswordOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  length: number;
}

export interface SecurePasswordHistoryItem {
  id: string;
  password: string; // Se encripta automáticamente
  date: string;
  options: PasswordOptions;
  hash?: string; // Hash para verificar integridad
}

export interface SecureVault {
  passwords: SecurePasswordHistoryItem[];
  lastModified: string;
  version: string;
}

export class SecurePasswordStorage {
  private static instance: SecurePasswordStorage;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): SecurePasswordStorage {
    if (!SecurePasswordStorage.instance) {
      SecurePasswordStorage.instance = new SecurePasswordStorage();
    }
    return SecurePasswordStorage.instance;
  }

  /**
   * Inicializa el almacenamiento seguro
   */
  async initialize(): Promise<void> {
    try {
      if (!encryptionService.isInitialized()) {
        await encryptionService.initialize();
      }
      this.isInitialized = true;
      console.log('🔐 Almacenamiento seguro inicializado');
    } catch (error) {
      console.error('❌ Error inicializando almacenamiento seguro:', error);
      throw new Error('Failed to initialize secure storage');
    }
  }

  /**
   * Guarda una nueva contraseña en el vault encriptado
   */
  async savePassword(password: string, options: PasswordOptions): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Crear nuevo item
      const newItem: SecurePasswordHistoryItem = {
        id: Date.now().toString(),
        password,
        date: new Date().toLocaleString('es-ES'),
        options: { ...options },
        hash: await encryptionService.generateHash(password)
      };

      // Cargar vault existente
      const vault = await this.loadVault();
      
      // Añadir nueva contraseña al principio
      vault.passwords.unshift(newItem);
      
      // Mantener solo las últimas 20 contraseñas
      vault.passwords = vault.passwords.slice(0, 20);
      vault.lastModified = new Date().toISOString();

      // Guardar vault encriptado
      await this.saveVault(vault);
      
      console.log('✅ Contraseña guardada de forma segura');
    } catch (error) {
      console.error('❌ Error guardando contraseña:', error);
      throw new Error('Failed to save password securely');
    }
  }

  /**
   * Carga todas las contraseñas del vault
   */
  async loadPasswords(): Promise<SecurePasswordHistoryItem[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const vault = await this.loadVault();
      
      // Verificar integridad de las contraseñas
      const validPasswords: SecurePasswordHistoryItem[] = [];
      
      for (const item of vault.passwords) {
        try {
          // Verificar hash si existe
          if (item.hash) {
            const currentHash = await encryptionService.generateHash(item.password);
            if (currentHash !== item.hash) {
              console.warn('⚠️ Contraseña con hash inválido, saltando:', item.id);
              continue;
            }
          }
          validPasswords.push(item);
        } catch (error) {
          console.warn('⚠️ Error verificando contraseña, saltando:', item.id);
        }
      }

      return validPasswords;
    } catch (error) {
      console.error('❌ Error cargando contraseñas:', error);
      return [];
    }
  }

  /**
   * Elimina una contraseña específica
   */
  async deletePassword(id: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const vault = await this.loadVault();
      vault.passwords = vault.passwords.filter(item => item.id !== id);
      vault.lastModified = new Date().toISOString();
      
      await this.saveVault(vault);
      console.log('✅ Contraseña eliminada de forma segura');
    } catch (error) {
      console.error('❌ Error eliminando contraseña:', error);
      throw new Error('Failed to delete password');
    }
  }

  /**
   * Limpia todo el historial de contraseñas
   */
  async clearAllPasswords(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const vault: SecureVault = {
        passwords: [],
        lastModified: new Date().toISOString(),
        version: '1.0.0'
      };
      
      await this.saveVault(vault);
      console.log('✅ Historial limpiado de forma segura');
    } catch (error) {
      console.error('❌ Error limpiando historial:', error);
      throw new Error('Failed to clear password history');
    }
  }

  /**
   * Exporta el vault para backup (encriptado)
   */
  async exportVault(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const vaultData = await encryptionService.secureRetrieve(SECURE_VAULT_KEY);
      if (!vaultData) {
        throw new Error('No vault data found');
      }
      
      // Crear backup con metadata
      const backup = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        deviceId: await encryptionService.generateHash(Date.now().toString()),
        encryptedVault: vaultData
      };

      return JSON.stringify(backup);
    } catch (error) {
      console.error('❌ Error exportando vault:', error);
      throw new Error('Failed to export vault');
    }
  }

  /**
   * Obtiene estadísticas del vault
   */
  async getVaultStats(): Promise<{
    totalPasswords: number;
    lastModified: string;
    strongPasswords: number;
    weakPasswords: number;
  }> {
    try {
      const passwords = await this.loadPasswords();
      
      let strongPasswords = 0;
      let weakPasswords = 0;

      passwords.forEach(item => {
        const { options } = item;
        let strength = 0;
        if (options.uppercase) strength++;
        if (options.lowercase) strength++;
        if (options.numbers) strength++;
        if (options.symbols) strength++;
        
        if (options.length >= 12 && strength >= 3) {
          strongPasswords++;
        } else {
          weakPasswords++;
        }
      });

      const vault = await this.loadVault();

      return {
        totalPasswords: passwords.length,
        lastModified: vault.lastModified,
        strongPasswords,
        weakPasswords
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        totalPasswords: 0,
        lastModified: 'Never',
        strongPasswords: 0,
        weakPasswords: 0
      };
    }
  }

  /**
   * Carga el vault completo (privado)
   */
  private async loadVault(): Promise<SecureVault> {
    try {
      const vaultData = await encryptionService.secureRetrieve(SECURE_VAULT_KEY);
      
      if (!vaultData) {
        // Crear vault vacío si no existe
        return {
          passwords: [],
          lastModified: new Date().toISOString(),
          version: '1.0.0'
        };
      }

      return JSON.parse(vaultData);
    } catch (error) {
      console.warn('⚠️ Error cargando vault, creando uno nuevo');
      return {
        passwords: [],
        lastModified: new Date().toISOString(),
        version: '1.0.0'
      };
    }
  }

  /**
   * Guarda el vault completo (privado)
   */
  private async saveVault(vault: SecureVault): Promise<void> {
    const vaultData = JSON.stringify(vault);
    await encryptionService.secureStore(SECURE_VAULT_KEY, vaultData);
  }

  /**
   * Reinicia completamente el almacenamiento
   */
  async reset(): Promise<void> {
    try {
      await encryptionService.secureDelete(SECURE_VAULT_KEY);
      await encryptionService.reset();
      this.isInitialized = false;
      console.log('🗑️ Almacenamiento seguro reiniciado');
    } catch (error) {
      console.error('❌ Error reiniciando almacenamiento:', error);
      throw new Error('Failed to reset secure storage');
    }
  }
}

// Instancia singleton
export const securePasswordStorage = SecurePasswordStorage.getInstance();
