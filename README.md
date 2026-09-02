# Trainplate

Fitness app (Expo / React Native + Hono on Vercel). Store name is **Trainplate**; bundle id is `com.trainplate.app`.

Home-screen name: **Trainplate**. Store listing (at submit time):

- Apple name + Play title: `Trainplate: Workout & Meal Log`
- Apple subtitle: `AI Calorie Scanner & Gym Plans`

## Store subscriptions

Create these exact product IDs in App Store Connect and Google Play Console. The app will not charge until they exist and the app is a store/TestFlight build.

| Plan | Product ID |
|---|---|
| Monthly | `com.trainplate.app.premium.monthly` |
| Annual | `com.trainplate.app.premium.annual` |

Paste these listing URLs (same copy as in the app):

- Privacy: https://potentialpeak-app-puce.vercel.app/privacy
- Terms: https://potentialpeak-app-puce.vercel.app/terms

Apple: one subscription group, auto-renewable, paid-apps agreement + banking. Google: one subscription with monthly and annual base plans using those IDs.

The API does **not** trust the phone. It verifies the Apple JWS / Play purchase token, then writes `user_entitlement`. Pro workout and meal-scan APIs read that row.

### What you still do by hand

1. Create those two product IDs in App Store Connect and Play Console. Paid-apps / billing profile + banking must be active.
2. Run the new Prisma migration on Neon (`npx prisma migrate deploy`) so `storeVerified` exists. Old client-claimed Pro rows are cleared.
3. **Android:** Play Console → Setup → API access → link a Google Cloud project → create a service account with **View financial data** / **Manage orders and subscriptions** → download JSON. Put `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (or email + private key) on **Vercel** and redeploy.
4. **iOS:** no key needed for purchase sync. In App Store Connect → your app → App Store Server Notifications, set Production and Sandbox to  
   `https://potentialpeak-app-puce.vercel.app/api/billing/apple-notifications`
5. **Play RTDN (optional but needed for instant refunds):** Play Console → Monetization setup → Real-time developer notifications → Pub/Sub topic, push endpoint  
   `https://potentialpeak-app-puce.vercel.app/api/billing/google-rtdn`
6. Sandbox / internal testing: use a TestFlight sandbox Apple ID and a Play license tester. Expo Go cannot buy these products.
7. Local only: `IAP_SKIP_VERIFY=true` in `.env.local` lets the API accept a token without calling the stores. Never set this on Vercel production.

### After the package / bundle ID change

The native ID is now `com.trainplate.app`. Recreate these when store accounts exist:

- Google Cloud: new Android package + iOS bundle + reversed-client URL scheme on the OAuth clients
- Apple: App ID `com.trainplate.app`, Sign in with Apple, IAP products with the SKUs above
- Play: application ID `com.trainplate.app`, subscription product IDs matching `skus.ts`
- Resend From name: Trainplate
- Local `.env.local` bundle/package vars (`APPLE_APP_BUNDLE_IDENTIFIER`, `APPLE_IAP_BUNDLE_ID`, `GOOGLE_PLAY_PACKAGE_NAME`)
- If you have a previous `ios/` or `android/` prebuild, regenerate with `npx expo prebuild --clean`

## Email (Resend)

Production email sign-up needs a **verified domain** on `RESEND_FROM_EMAIL`. Until then, use Google / Apple sign-in or the Resend account-owner inbox.

## Demo build (Android APK)

From this directory:

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
