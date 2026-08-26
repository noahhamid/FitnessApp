# PotentialPeak

Fitness app (Expo / React Native + Hono on Vercel). Store name is **PotentialPeak**; bundle id is `com.exo.fitness`.

## Store subscriptions

Create these exact product IDs in App Store Connect and Google Play Console. The app will not charge until they exist and the app is a store/TestFlight build.

| Plan | Product ID |
|---|---|
| Monthly | `com.exo.fitness.premium.monthly` |
| Annual | `com.exo.fitness.premium.annual` |

Paste these listing URLs (same copy as in the app):

- Privacy: https://potentialpeak-app-puce.vercel.app/privacy
- Terms: https://potentialpeak-app-puce.vercel.app/terms

Apple: one subscription group, auto-renewable, paid-apps agreement + banking. Google: one subscription with monthly and annual base plans using those IDs.

## Email (Resend)

Production email sign-up needs a **verified domain** on `RESEND_FROM_EMAIL`. Until then, use Google / Apple sign-in or the Resend account-owner inbox.

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
