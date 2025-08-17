# 🔐 MasterPass - Generador de Contraseñas Seguras

Una aplicación móvil desarrollada con React Native y Expo que te permite generar contraseñas seguras y mantener un historial de las contraseñas generadas.

## 📱 Características

### ✨ **Generación de Contraseñas**
- Contraseñas aleatorias y seguras
- Configuración personalizable:
  - Mayúsculas (A-Z)
  - Minúsculas (a-z)
  - Números (0-9)
  - Símbolos especiales (!@#$%^&*)
- Longitud ajustable (4-50 caracteres)
- Longitud mínima recomendada: 12 caracteres

### 📚 **Historial de Contraseñas**
- Guardado automático de contraseñas generadas
- Historial persistente (hasta 20 contraseñas)
- Información detallada de cada contraseña:
  - Fecha y hora de generación
  - Longitud de la contraseña
  - Configuración utilizada
  - Nivel de seguridad
- Copia rápida al portapapeles
- Eliminación individual o masiva

### 📖 **Recomendaciones de Seguridad**
- Guía completa sobre contraseñas seguras
- Estadísticas de seguridad importantes
- Mejores prácticas para proteger tus cuentas

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
GeneradorContrasenaSegura/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Layout de las pestañas
│   │   ├── index.tsx            # Pantalla principal (Generador)
│   │   └── history.tsx          # Pantalla de historial
│   ├── _layout.tsx              # Layout principal
│   ├── modal.tsx                # Pantalla de recomendaciones
│   └── +not-found.tsx           # Pantalla 404
├── components/                   # Componentes reutilizables
├── constants/                    # Constantes y configuraciones
├── assets/                       # Recursos (imágenes, fonts)
├── package.json                  # Dependencias del proyecto
└── README.md                     # Este archivo
```

## 🛠 Tecnologías Utilizadas

- **React Native** - Framework para desarrollo móvil
- **Expo** - Plataforma de desarrollo y despliegue
- **TypeScript** - Lenguaje de programación tipado
- **Expo Router** - Sistema de navegación
- **AsyncStorage** - Almacenamiento local persistente
- **Expo Vector Icons** - Iconografía

## 📦 Dependencias Principales

```json
{
  "expo": "~53.0.20",
  "react": "19.0.0",
  "react-native": "0.79.5",
  "expo-router": "~5.1.4",
  "@react-native-async-storage/async-storage": "2.1.2",
  "@expo/vector-icons": "^14.1.0"
}
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno

No se requieren variables de entorno especiales para esta aplicación.

### Configuración de Expo

El proyecto está configurado con Expo SDK 53. La configuración se encuentra en:
- `app.json` - Configuración principal de la app
- `expo-env.d.ts` - Tipos de TypeScript para Expo

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
   # Android
   eas build --platform android
   
   # iOS
   eas build --platform ios
   
   # Ambas plataformas
   eas build --platform all
   ```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error: Metro bundler no inicia**
   ```bash
   npx expo start --clear
   ```

2. **Problema con dependencias**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Error en iOS Simulator**
   ```bash
   npx expo run:ios --device
   ```

4. **Cache de Expo**
   ```bash
   npx expo install --fix
   ```

### Logs y Debugging

- Los logs aparecen en la terminal donde ejecutaste `npm start`
- Para debugging avanzado, usa el debugger de React Native
- Presiona `j` en la terminal para abrir las herramientas de desarrollo

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia 0BSD - ver el archivo `package.json` para más detalles.

## 👤 Autor

**Roberto8695**
- GitHub: [@Roberto8695](https://github.com/Roberto8695)

## 🙏 Agradecimientos

- Expo Team por la excelente plataforma de desarrollo
- React Native Community por los recursos y documentación
- Iconos proporcionados por Expo Vector Icons

---

## 📞 Soporte

Si tienes algún problema o pregunta:

1. Revisa la sección de [Solución de Problemas](#-solución-de-problemas)
2. Consulta la [documentación de Expo](https://docs.expo.dev/)
3. Abre un issue en este repositorio

---

**¡Disfruta generando contraseñas seguras! 🔐**
