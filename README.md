# Gainly

Mobile app (Expo / React Native) for logging protein and carbohydrates per meal and tracking daily goal completion.

## Run

```bash
npm install
npx expo start          # scan the QR code with Expo Go (iOS / Android)
npx expo start --web    # web version for quick testing
```

## Checks

```bash
npm test                # goal logic, daily status, foods
npx tsc --noEmit
npx expo lint
```

## Structure

- `src/app/` — screens (Expo Router): `login`, `onboarding`, `(tabs)/index` (Today), `(tabs)/calendario`, `(tabs)/perfil`, `agregar-comida`, `alimento-nuevo`, `editar-perfil`.
- `src/lib/objetivos.ts` — goal calculation (Mifflin-St Jeor × activity factor, adjustment by goal, protein in g/kg, carbs from the remaining calories).
- `src/lib/estadoDia.ts` — achieved / almost / not achieved, based on the macro with the lowest % and the user's thresholds.
- `src/data/alimentos.ts` — food table (g per 100 g).
- `src/store/useApp.ts` — local persistent state (zustand + AsyncStorage), separated per user.
- `src/lib/auth/` — `AuthService` + `mockAuth` (simulated login).
- `src/theme/colors.ts` — color palette.

## Real login (pending)

Login is currently simulated and everything is stored on the device. For real Google, Facebook, and Apple sign-in: create an `AuthService` implementation (e.g. with Firebase Auth using `@react-native-google-signin/google-signin`, `react-native-fbsdk-next`, and `expo-apple-authentication`), switch `auth` in `src/lib/auth/mockAuth.ts`, and create a development build (`npx expo run:ios|android` or EAS). This requires Apple and Meta developer accounts and a project in the provider's console.
