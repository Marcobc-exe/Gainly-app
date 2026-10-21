# Gainly

App móvil (Expo / React Native) para registrar proteínas y carbohidratos por comida y seguir el cumplimiento diario.

## Ejecutar

```bash
npm install
npx expo start          # escanea el QR con Expo Go (iOS / Android)
npx expo start --web    # versión web para pruebas rápidas
```

## Comprobaciones

```bash
npm test                # lógica de metas, estados del día, alimentos
npx tsc --noEmit
npx expo lint
```

## Estructura

- `src/app/` — pantallas (Expo Router): `login`, `onboarding`, `(tabs)/index` (Hoy), `(tabs)/calendario`, `(tabs)/perfil`, `agregar-comida`, `alimento-nuevo`, `editar-perfil`.
- `src/lib/objetivos.ts` — cálculo de metas (Mifflin-St Jeor × factor de actividad, ajuste por objetivo, proteína g/kg, carbos con las calorías restantes).
- `src/lib/estadoDia.ts` — logrado / casi / no logrado según el macro con menor % y los umbrales del usuario.
- `src/data/alimentos.ts` — tabla de alimentos (g por 100 g).
- `src/store/useApp.ts` — estado persistente local (zustand + AsyncStorage), separado por usuario.
- `src/lib/auth/` — `AuthService` + `mockAuth` (login simulado).
- `src/theme/colors.ts` — paleta.

## Login real (pendiente)

Hoy el inicio de sesión es simulado y todo se guarda en el dispositivo. Para Google, Facebook y Apple reales: crear una implementación de `AuthService` (p. ej. con Firebase Auth usando `@react-native-google-signin/google-signin`, `react-native-fbsdk-next` y `expo-apple-authentication`), cambiar `auth` en `src/lib/auth/mockAuth.ts` y generar un development build (`npx expo run:ios|android` o EAS). Requiere cuentas de desarrollador de Apple y Meta y un proyecto en la consola del proveedor.
