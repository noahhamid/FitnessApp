# Exo

Fitness app (Expo / React Native + Hono on Vercel). Display name is **Exo**; Expo slug and API host remain `potential-peak`.

## Demo build (Android APK)

From this directory (`my-app`):

```bash
eas build --platform android --profile preview
```

Sideload the APK. Do **not** use the `production` profile for a boss demo — that outputs an AAB.

Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in EAS env (same Google **Web** client ID as Vercel `GOOGLE_CLIENT_ID`) before tapping Continue with Google on a device build. Register the EAS keystore SHA-1 on the Android OAuth client.

Email verification still requires a verified Resend domain. Until then, demo with Google or the Resend account-owner inbox only.

## Local

```bash
npm ci
cp .env.example .env.local   # then fill secrets
npx expo start
npm run dev:server           # API on PORT from .env.local
```

## Checks

```bash
npm run typecheck
npm run typecheck:server
```
