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

## Publish to my phone (EAS Update + Expo Go)

The app is published to Expo's servers (project `@marco.exe/gainly`, branch `produccion`), so it opens in Expo Go without the PC running.

**Open it on the iPhone:** sign in to Expo Go with the same Expo account → **Projects → gainly → produccion** (or scan the QR under *Preview* in the update page on expo.dev). After the first time it stays in *Recently opened*.

**Publish a new version after changing the code:**

```bash
npm test && npx tsc --noEmit
npm run publicar -- "What changed"
```

Expo Go downloads the new version the next time the app is opened (close it completely and reopen it if needed).

**When Expo Go updates to a new SDK** (the published app stops opening with a version mismatch error):

```bash
npx expo install expo@^59.0.0 --fix
npx expo-doctor
npx tsc --noEmit && npm test && npx expo lint
npm run publicar -- "Update to SDK 59"
```

If `--fix` fails with `npm ERESOLVE`, copy the expected versions it prints into `package.json` (dev dependencies like `jest-expo` and `eslint-config-expo` too), then do a clean install: `rm -rf node_modules package-lock.json && npm install`. Read the SDK changelog first: the SDK 58 upgrade changed the custom tab bar API (`src/components/BarraPestanas.tsx` now uses `emitter` and `navigateToTab`).

Notes: `runtimeVersion` uses the `sdkVersion` policy (currently `exposdk:58.0.0`), which is what Expo Go requires. `npm run publicar` runs `scripts/publicar.mjs`, which calls `npx eas-cli@latest update` (no global install needed). Data is stored on the phone, separately from the data used while testing with `npx expo start`.
