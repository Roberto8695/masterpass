# Autenticación Biométrica en MasterPass

## ¿Qué se ha implementado?

Se ha agregado autenticación biométrica completa a tu aplicación MasterPass. Ahora la aplicación requerirá autenticación con huella digital, Face ID o PIN del dispositivo antes de permitir el acceso.

## Características implementadas:

### 🔒 Autenticación Obligatoria
- La aplicación solicita autenticación biométrica al iniciarse
- No se puede acceder a las funciones sin autenticar primero
- Soporte para huella digital, Face ID y PIN de respaldo

### 🔧 Componentes Agregados

1. **Hook personalizado**: `useBiometricAuth.ts`
   - Maneja toda la lógica de autenticación biométrica
   - Verifica disponibilidad del hardware
   - Gestiona el proceso de autenticación

2. **Pantalla de autenticación**: `BiometricAuthScreen.tsx`
   - Interfaz amigable para la autenticación
   - Mensajes claros para el usuario
   - Manejo de errores

3. **Contexto de autenticación**: `AuthContext.tsx`
   - Gestiona el estado global de autenticación
   - Permite cerrar sesión desde cualquier pantalla

### 🎯 Funcionalidades

- **Autenticación automática**: Se solicita al abrir la app
- **Verificación de hardware**: Detecta si el dispositivo soporta biometría
- **Mensajes de error claros**: Informa sobre problemas específicos
- **Botón de logout**: Permite cerrar sesión y reautenticarse
- **Persistencia de sesión**: Mantiene la sesión hasta que se cierre manualmente

### 📱 Soporte de Plataformas

- **Android**: Huella digital, PIN, patrón
- **iOS**: Touch ID, Face ID, PIN
- **Permisos configurados**: Automáticamente en el build

## Cómo probar:

1. **Desarrollo**:
   ```bash
   npx expo start
   ```

2. **Build para Android**:
   ```bash
   npx expo build:android
   ```

3. **Run en dispositivo físico** (recomendado para probar biometría):
   ```bash
   npx expo run:android
   ```

## Configuración personalizable:

En `app/_layout.tsx`, puedes cambiar:
```typescript
allowSkip={false} // Cambiar a true para permitir saltar autenticación
```

## Notas importantes:

- La autenticación biométrica funciona mejor en dispositivos físicos
- En emuladores, es posible que no esté disponible
- Si no hay biometría configurada, se puede usar PIN del dispositivo
- El estado de autenticación se limpia al cerrar la aplicación completamente

## Seguridad:

- No se almacenan datos biométricos en la aplicación
- Solo se usa la API nativa del sistema operativo
- La autenticación se requiere en cada inicio de la aplicación
- El logout limpia completamente la sesión

¡Tu aplicación MasterPass ahora está protegida con autenticación biométrica!
