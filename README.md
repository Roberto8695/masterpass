# 🔐 MasterPass - Gestor de Cont### 🗂️ **Gestor de Cuentas (Mis Cuentas)**
- **Almacenamiento seguro** de todas tus credenciales
- **Encriptación AES-256** para máxima seguridad
- **Edición completa** de cuentas guardadas:
  - Actualizar contraseñas
  - Modificar información de contacto
  - Cambiar categorías y etiquetas
  - Editar notas y URLs
- Organización por categorías:
  - Redes Sociales
  - Bancos
  - Trabajo
  - Entretenimiento
  - Compras
  - Email
  - Desarrollo
  - Y más...
- **Búsqueda y filtrado** avanzado
- **Copia rápida** al portapapeles
- Información detallada de cada cuenta:
  - Sitio web y URL
  - Usuario y email
  - Fecha de creación y última modificación
  - Etiquetas personalizadas
  - Notas adicionalesna aplicación móvil desarrollada con React 3. **Expo Go** en tu dispositivo móvil
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

4. **Dispositivo con capacidades biométricas** (recomendado)
   - Touch ID o Face ID (iOS)
   - Huella dactilar o reconocimiento facial (Android)

### Instalación del Proyectoe y Expo que te permite generar contraseñas seguras, gestionar tus cuentas y mantener toda tu información protegida con autenticación biométrica.

## 📱 Características

### 🔒 **Autenticación Biométrica**
- Protección con huella dactilar o reconocimiento facial
- Acceso seguro a la aplicación mediante Touch ID/Face ID
- Verificación biométrica antes del inicio de la aplicación
- Fallback a autenticación por PIN si la biometría no está disponible

### ✨ **Generador de Contraseñas**
- Contraseñas aleatorias y criptográficamente seguras
- Configuración personalizable:
  - Mayúsculas (A-Z)
  - Minúsculas (a-z)
  - Números (0-9)
  - Símbolos especiales (!@#$%^&*)
- Longitud ajustable (15-50 caracteres)
- **Longitud mínima de seguridad: 15 caracteres**
- Indicador de fortaleza en tiempo real
- **Autocompletado**: Guarda directamente como nueva cuenta

### �️ **Gestor de Cuentas (Mis Cuentas)**
- **Almacenamiento seguro** de todas tus credenciales
- **Encriptación AES-256** para máxima seguridad
- Organización por categorías:
  - Redes Sociales
  - Bancos
  - Trabajo
  - Entretenimiento
  - Compras
  - Email
  - Desarrollo
  - Y más...
- **Búsqueda y filtrado** avanzado
- **Copia rápida** al portapapeles
- Información detallada de cada cuenta:
  - Sitio web y URL
  - Usuario y email
  - Fecha de creación y última modificación
  - Etiquetas personalizadas
  - Notas adicionales

### 📊 **Historial y Análisis**
- **Historial cronológico** de todas las contraseñas
- **Ordenamiento inteligente**:
  - Por fecha de creación
  - Por frecuencia de uso
  - Por nivel de seguridad
- **Análisis de fortaleza** de contraseñas
- Seguimiento de uso y última utilización

### ☁️ **Respaldo y Seguridad**
- **Estadísticas de seguridad** completas:
  - Contraseñas fuertes vs débiles
  - Score de seguridad general
  - Contraseñas moderadas
  - Última modificación
- **Exportación segura** de datos en múltiples formatos:
  - **📄 Formato JSON**: Completo con metadatos y estructura
  - **📊 Formato CSV**: Compatible con Excel y hojas de cálculo
- **Respaldo encriptado** local en tu dispositivo
- **Eliminación masiva** con confirmación de seguridad
- Información de encriptación AES-256

### 🛡️ **Seguridad Avanzada**
- **Base de datos SQLite encriptada** localmente
- **Migración automática** de datos legacy
- **Almacenamiento seguro** con Expo SecureStore
- **Validación de integridad** de datos
- **Logs de auditoría** para debugging

## 🚀 Instalación y Configuración

### Prerrequisitos

Asegúrate de tener instalado lo siguiente en tu sistema:

1. **Node.js** (versión 18 o superior)
   ```bash
   # Verificar versión
   node --version
   ```

2. **npm** o **yarn**
   ```bash
   # Verificar versión de npm
   npm --version
   ```

3. **Expo CLI** (opcional, pero recomendado)
   ```bash
   npm install -g expo-cli
   ```

4. **Expo Go** en tu dispositivo móvil
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Instalación del Proyecto

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Roberto8695/masterpass.git
   cd masterpass
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

   O si prefieres usar yarn:
   ```bash
   yarn install
   ```

## 🏃‍♂️ Ejecución de la Aplicación

### Primera Ejecución

Al iniciar la aplicación por primera vez:

1. **Configuración biométrica**: La aplicación te solicitará permisos para usar la autenticación biométrica
2. **Migración automática**: Si tienes datos previos, se migrarán automáticamente a la nueva base de datos encriptada
3. **Inicialización segura**: Se configurará el almacenamiento seguro y la encriptación

### Navegación de la Aplicación

La aplicación cuenta con **4 pestañas principales**:

- **🔐 Generador**: Crea contraseñas seguras con autocompletado para nuevas cuentas
- **📁 Mis Cuentas**: Gestiona todas tus credenciales guardadas
- **☁️ Respaldo**: Estadísticas de seguridad, exportación y gestión de datos
- **📊 Historial**: Vista cronológica y análisis de todas tus contraseñas

### Modo de Desarrollo

1. **Iniciar el servidor de desarrollo**
   ```bash
   npm start
   ```
   
   O con Expo CLI:
   ```bash
   expo start
   ```

2. **Opciones de ejecución:**

   **📱 En dispositivo físico (Recomendado):**
   - Escanea el código QR que aparece en la terminal con la app Expo Go
   - La aplicación se cargará automáticamente

   **🌐 En navegador web:**
   ```bash
   npm run web
   ```
   O presiona `w` en la terminal cuando esté ejecutándose

   **🤖 En Android (Emulador):**
   ```bash
   npm run android
   ```
   O presiona `a` en la terminal cuando esté ejecutándose

   **🍎 En iOS (Simulador - solo en Mac):**
   ```bash
   npm run ios
   ```
   O presiona `i` en la terminal cuando esté ejecutándose

### Comandos Útiles

```bash
# Reiniciar la aplicación
# Presiona 'r' en la terminal

# Limpiar caché y reiniciar
npx expo start --clear

# Ver logs en tiempo real
# Los logs aparecen automáticamente en la terminal

# Abrir debugger
# Presiona 'j' en la terminal o agita tu dispositivo
```

## 📁 Estructura del Proyecto

```
MasterPass/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Layout de las pestañas principales
│   │   ├── index.tsx            # Generador de contraseñas
│   │   ├── history_new.tsx      # Mis Cuentas (gestión de credenciales)
│   │   ├── history_backup.tsx   # Respaldo y estadísticas
│   │   └── history.tsx          # Historial cronológico
│   ├── _layout.tsx              # Layout principal con auth biométrica
│   ├── modal.tsx                # Pantallas modales
│   └── +not-found.tsx           # Pantalla 404
├── components/
│   ├── AccountCard.tsx          # Tarjeta individual de cuenta
│   ├── AddPasswordForm.tsx      # Formulario para nuevas cuentas
│   ├── BiometricAuthScreen.tsx  # Pantalla de autenticación biométrica
│   ├── SecurityStats.tsx        # Componente de estadísticas de seguridad
│   └── AccountSearchAndFilter.tsx # Búsqueda y filtrado avanzado
├── contexts/
│   └── AuthContext.tsx          # Contexto de autenticación global
├── hooks/
│   ├── useDatabase.ts           # Hook principal de base de datos
│   └── useBiometricAuth.ts      # Hook de autenticación biométrica
├── services/
│   ├── DatabaseService.ts       # Servicio de base de datos SQLite
│   ├── EncryptionService.ts     # Servicio de encriptación AES-256
│   ├── MigrationService.ts      # Servicio de migración de datos
│   └── SecurePasswordStorage.ts # Almacenamiento seguro local
├── constants/                   # Constantes y configuraciones
├── assets/                      # Recursos (imágenes, fonts)
├── android/                     # Configuración específica de Android
├── package.json                 # Dependencias del proyecto
├── eas.json                     # Configuración de Expo Application Services
└── README.md                    # Este archivo
```

## 🛠 Tecnologías Utilizadas

### Core Technologies
- **React Native 0.79.5** - Framework para desarrollo móvil
- **Expo SDK 53** - Plataforma de desarrollo y despliegue
- **TypeScript** - Lenguaje de programación tipado
- **Expo Router 5.1.4** - Sistema de navegación file-based

### Seguridad y Autenticación
- **Expo Local Authentication** - Autenticación biométrica nativa
- **Expo Secure Store** - Almacenamiento seguro de datos sensibles
- **SQLite** - Base de datos local con encriptación
- **AES-256** - Algoritmo de encriptación estándar

### Base de Datos y Almacenamiento
- **Expo SQLite** - Base de datos relacional local
- **AsyncStorage** - Almacenamiento persistente para configuraciones
- **Custom Migration Service** - Sistema de migración de datos automático

### UI/UX
- **Expo Vector Icons** - Iconografía completa
- **React Native StyleSheet** - Estilos nativos optimizados
- **Custom Components** - Componentes reutilizables personalizados

## 📦 Dependencias Principales

```json
{
  "expo": "~53.0.20",
  "react": "19.0.0",
  "react-native": "0.79.5",
  "expo-router": "~5.1.4",
  "expo-local-authentication": "~15.0.2",
  "expo-secure-store": "~14.0.0",
  "expo-sqlite": "~15.1.1",
  "@react-native-async-storage/async-storage": "2.1.2",
  "@expo/vector-icons": "^14.1.0"
}
```

### Dependencias de Seguridad
```json
{
  "expo-crypto": "~14.0.1",
  "expo-device": "~7.0.1",
  "expo-clipboard": "~7.0.1"
}
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno

La aplicación no requiere variables de entorno especiales, ya que utiliza almacenamiento local seguro.

### Configuración de Expo

El proyecto está configurado con Expo SDK 53. La configuración se encuentra en:
- `app.json` - Configuración principal de la app
- `eas.json` - Configuración de EAS Build para compilación
- `expo-env.d.ts` - Tipos de TypeScript para Expo

### Configuración de Seguridad

La aplicación implementa múltiples capas de seguridad:
- **Encriptación local**: Todos los datos se encriptan antes de almacenarse
- **Autenticación biométrica**: Requerida para acceder a la aplicación
- **Validación de integridad**: Los datos se validan en cada operación
- **Almacenamiento seguro**: Uso de Expo SecureStore para claves sensibles

## 🔐 Flujo de Seguridad

### Primer Inicio
1. **Verificación biométrica** disponible en el dispositivo
2. **Inicialización** del servicio de encriptación
3. **Creación** de la base de datos SQLite encriptada
4. **Migración automática** de datos existentes (si los hay)

### Uso Normal
1. **Autenticación biométrica** al abrir la app
2. **Desencriptación** automática de datos cuando sea necesario
3. **Operaciones CRUD** seguras en la base de datos
4. **Reencriptación** automática al guardar

### Gestión de Datos
- **Backup**: Exportación de datos encriptados
- **Migración**: Sistema automático de actualización de esquemas
- **Limpieza**: Eliminación segura con sobrescritura de memoria

### Exportación de Datos

MasterPass incluye un sistema completo de exportación para respaldar tus credenciales:

#### 📄 Formato de Exportación
- **Formatos disponibles**: JSON y CSV
  - **JSON**: Formato completo con metadatos, estructura jerárquica y toda la información
  - **CSV**: Compatible con Excel, Google Sheets y otras hojas de cálculo
- **Encriptación**: Las contraseñas se exportan encriptadas (seguridad mantenida)
- **Metadatos**: Incluye información de versión, fecha y estadísticas
- **Compatibilidad**: Formatos estándar que pueden importarse en futuras versiones

#### 📁 Ubicación de Archivos
- **Carpeta**: Documentos del dispositivo (`Documents/`)
- **Nomenclatura JSON**: `masterpass-backup-YYYY-MM-DDTHH-MM-SS.json`
- **Nomenclatura CSV**: `masterpass-backup-YYYY-MM-DDTHH-MM-SS.csv`
- **Acceso**: Disponible a través del gestor de archivos del dispositivo
- **Compartir**: Se abre automáticamente el diálogo de compartir

#### 📤 Proceso de Exportación
1. Ve a la pestaña **"☁️ Respaldo"**
2. Toca **"Exportar Datos"**
3. **Selecciona el formato**: JSON (completo) o CSV (hoja de cálculo)
4. Confirma la acción (se muestra el número de cuentas)
5. El archivo se crea automáticamente
6. Se abre el diálogo para compartir/guardar
7. El archivo queda guardado en Documentos

#### 🔍 Ejemplo de Estructura de Exportación

**Formato JSON:**
```json
{
  "appName": "MasterPass",
  "version": "1.0.0",
  "exportDate": "2024-01-15T10:30:00.000Z",
  "totalPasswords": 25,
  "encrypted": true,
  "format": "MasterPass JSON Export",
  "note": "Este archivo contiene tus contraseñas encriptadas. Manténlo seguro.",
  "passwords": [
    {
      "id": "unique-id",
      "siteName": "GitHub",
      "siteUrl": "https://github.com",
      "username": "usuario",
      "email": "correo@ejemplo.com",
      "password": "[ENCRIPTADO]",
      "category": "Desarrollo",
      "tags": ["trabajo", "git"],
      "notes": "Cuenta principal",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastModified": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Formato CSV:**
```csv
Sitio,URL,Usuario,Email,Contraseña,Categoría,Etiquetas,Notas,Fecha Creación,Última Modificación,Último Uso
GitHub,https://github.com,usuario,correo@ejemplo.com,[ENCRIPTADO],Desarrollo,"trabajo; git","Cuenta principal",2024-01-01T00:00:00.000Z,2024-01-15T10:30:00.000Z,2024-01-10T15:20:00.000Z
Gmail,https://gmail.com,correo@ejemplo.com,correo@ejemplo.com,[ENCRIPTADO],Email,"personal; importante","Email principal",2024-01-02T00:00:00.000Z,2024-01-14T08:15:00.000Z,2024-01-15T09:00:00.000Z
```

#### 🛡️ Seguridad de la Exportación
- **Contraseñas encriptadas**: No se exportan en texto plano
- **Archivo local**: Solo se almacena en tu dispositivo
- **Compartir opcional**: Tú decides si y cómo compartir el archivo
- **Sin conexión**: No requiere internet ni servicios externos

#### ✏️ Edición de Cuentas Guardadas

MasterPass permite editar completamente cualquier cuenta guardada:

##### 📝 Campos Editables
- **Información básica**:
  - Nombre del sitio
  - URL del sitio web
- **Credenciales**:
  - Nombre de usuario
  - Dirección de email
  - Contraseña (se mantiene encriptada)
- **Organización**:
  - Categoría (selección visual)
  - Etiquetas personalizadas
  - Notas adicionales

##### 🔧 Proceso de Edición
1. Ve a la pestaña **"📁 Mis Cuentas"**
2. Toca una cuenta para ver sus detalles
3. Presiona el **botón de editar** (icono lápiz)
4. Modifica los campos que necesites
5. Toca **"Guardar"** para confirmar los cambios
6. Los cambios se aplican inmediatamente y se encriptan

##### 🔐 Seguridad en la Edición
- **Encriptación mantenida**: Los datos se reencriptan automáticamente
- **Validaciones**: Campos obligatorios y formatos correctos
- **Historial**: Se actualiza la fecha de última modificación
- **Cancelación segura**: Puedes cancelar sin perder datos originales

## 🚀 Despliegue

### Construcción para Producción

1. **Para Android (APK/AAB):**
   ```bash
   npx expo build:android
   ```

2. **Para iOS (IPA):**
   ```bash
   npx expo build:ios
   ```

3. **Para Web:**
   ```bash
   npx expo export:web
   ```

### Usando EAS Build (Recomendado)

1. **Instalar EAS CLI:**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Configurar EAS:**
   ```bash
   eas build:configure
   ```

3. **Construir para producción:**
   ```bash
   # Android APK (para testing)
   eas build --platform android --profile preview
   
   # Android AAB (para Play Store)
   eas build --platform android --profile production
   
   # iOS (requiere cuenta de desarrollador Apple)
   eas build --platform ios --profile production
   
   # Ambas plataformas
   eas build --platform all
   ```

## 🧪 Testing y Calidad

### Testing Manual
- **Autenticación biométrica** en diferentes dispositivos
- **Migración de datos** desde versiones anteriores
- **Encriptación/desencriptación** de datos sensibles
- **Rendimiento** con grandes volúmenes de contraseñas

### Validaciones de Seguridad
- **Fortaleza de contraseñas** con algoritmos actualizados
- **Integridad de datos** en operaciones CRUD
- **Validación de entrada** para prevenir inyecciones
- **Gestión segura de memoria** para datos sensibles

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error: La autenticación biométrica no funciona**
   ```bash
   # Verifica permisos en la configuración del dispositivo
   # Asegúrate de que la biometría esté configurada
   # Reinicia la aplicación y otorga permisos
   ```

2. **Error: No se cargan las cuentas guardadas**
   ```bash
   # Fuerza la sincronización usando el botón de refresh
   # Reinicia la aplicación
   npx expo start --clear
   ```

3. **Error: Metro bundler no inicia**
   ```bash
   npx expo start --clear
   ```

4. **Problema con dependencias**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

5. **Error en iOS Simulator**
   ```bash
   npx expo run:ios --device
   ```

6. **Error de migración de datos**
   ```bash
   # Los datos se migrarán automáticamente
   # Si hay problemas, la app creará una nueva base de datos
   # Los datos antiguos se mantienen como respaldo
   ```

7. **Cache de Expo**
   ```bash
   npx expo install --fix
   expo doctor
   ```

### Problemas de Seguridad

1. **Problemas de encriptación**
   - La aplicación recrea automáticamente las claves de encriptación
   - Los datos se reencriptan con nuevas claves si es necesario

2. **Autenticación fallida repetidamente**
   - Verifica que la biometría esté configurada en el dispositivo
   - Reinicia la aplicación e intenta nuevamente
   - La aplicación permite fallback a autenticación alternativa

### Logs y Debugging

- Los logs aparecen en la terminal donde ejecutaste `npm start`
- Para debugging avanzado, usa el debugger de React Native
- Presiona `j` en la terminal para abrir las herramientas de desarrollo
- Los logs de seguridad se marcan con emojis específicos:
  - 🔐 Autenticación
  - 🔒 Encriptación
  - 📊 Base de datos
  - ⚡ Rendimiento

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia 0BSD - ver el archivo `package.json` para más detalles.

## � Roadmap y Mejoras Futuras

### Funcionalidades Planeadas
- [ ] **Sincronización en la nube** con encriptación end-to-end
- [ ] **Generador de passphrase** con palabras aleatorias
- [ ] **Verificación de brechas de seguridad** contra bases de datos conocidas
- [ ] **Autofill integrado** para aplicaciones y navegadores
- [ ] **Compartir contraseñas** de forma segura y temporal
- [ ] **Auditoría de seguridad** automatizada
- [ ] **Backup automático** en intervalos configurables
- [ ] **Múltiples bóvedas** para diferentes propósitos

### Mejoras de UX
- [ ] **Modo oscuro** completo
- [ ] **Widgets de acceso rápido**
- [ ] **Notificaciones** para renovación de contraseñas
- [ ] **Importación** desde otros gestores de contraseñas
- [ ] **Búsqueda inteligente** con sugerencias
- [ ] **Personalización** de categorías y etiquetas

## �👤 Autor

**Roberto8695**
- GitHub: [@Roberto8695](https://github.com/Roberto8695)
- Proyecto: [MasterPass](https://github.com/Roberto8695/masterpass)

## 🙏 Agradecimientos

- **Expo Team** por la excelente plataforma de desarrollo y las APIs de seguridad
- **React Native Community** por los recursos y documentación
- **Iconos** proporcionados por Expo Vector Icons
- **Comunidad de seguridad** por las mejores prácticas de encriptación
- **Contributors** que han ayudado a mejorar la aplicación

## 📊 Estadísticas del Proyecto

- **Lenguaje principal**: TypeScript (95%)
- **Plataformas soportadas**: iOS, Android
- **Arquitectura**: MVVM con hooks y contexts
- **Testing**: Manual y casos de uso críticos
- **Seguridad**: AES-256, almacenamiento local encriptado

---

## 📞 Soporte

Si tienes algún problema o pregunta:

1. **Revisa la sección de [Solución de Problemas](#-solución-de-problemas)**
2. **Consulta la [documentación de Expo](https://docs.expo.dev/)**
3. **Abre un issue** en este repositorio con:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Información del dispositivo y versión de la app
   - Logs relevantes (sin información sensible)

### Reportar Problemas de Seguridad

Para reportar vulnerabilidades de seguridad:
- **NO** abras un issue público
- Contacta directamente al maintainer
- Proporciona detalles técnicos y pasos de reproducción
- Permite tiempo razonable para la corrección antes de divulgación

---

## 🔒 Nota de Seguridad

Esta aplicación está diseñada para almacenar datos sensibles de forma segura. Sin embargo:

- **Mantén tu dispositivo actualizado** con los últimos parches de seguridad
- **Usa autenticación biométrica** siempre que sea posible
- **Realiza backups regulares** de tus datos
- **No compartas** tu dispositivo con personas no autorizadas
- **Reporta cualquier comportamiento sospechoso** inmediatamente

**¡Disfruta gestionando tus contraseñas de forma segura! 🔐**
