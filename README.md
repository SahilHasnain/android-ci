# android-ci

Scaffold an Expo Android GitHub Actions workflow with two manual build choices: a debug APK or a signed production release.

## Run from an app repository

```bash
npx --yes --package=github:SahilHasnain/android-ci android-ci init --target .
```

Or from a local clone of this repo:

```bash
npm install
npm run dev -- init --target ../your-app
```

`init` generates `.github/workflows/android-ci.yml`, the release-signing helper, and (when Play deployment is enabled) a root `Gemfile` and `fastlane/Fastfile`.

## Android directory and Fastlane

The workflow runs Expo prebuild on the GitHub runner. The generated `android/` directory is temporary and should remain ignored by Git. Fastlane files stay at the application repository root so they persist across prebuilds.

## Workflow choices

- **debug-apk** builds an installable debug APK and uploads it as an Actions artifact.
- **production** creates a signed AAB, uploads the artifact, and optionally deploys it to Google Play.
- Pushes to `main` and pull requests use the debug APK path. Production is only started manually from Actions.

## GitHub Actions secrets

Production signing requires:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `PLAY_STORE_JSON_BASE64` when Play deployment is enabled

If the app's `app.json` specifies `android.googleServicesFile`, also add `GOOGLE_SERVICES_JSON_BASE64` containing that file encoded as one Base64 line.

Create these under **Repository Settings → Secrets and variables → Actions**. Never commit keystores or service-account private keys.

`PLAY_TRACK` is an optional repository variable; it defaults to `production`.

## Publishing this CLI

The package exposes the `android-ci` executable from `dist/cli.js`. After changing TypeScript sources, run:

```bash
npm run check
npm run build
```

Commit both source and generated `dist/` files so the GitHub package can execute the updated CLI.
