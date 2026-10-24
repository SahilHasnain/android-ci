# Expo Android CI migration

The scaffold now assumes Expo prebuild and GitHub-hosted runners.

## Project layout

- Keep generated `android/` ignored and out of source control.
- Run `npx expo prebuild --platform android --no-install` in the workflow.
- Keep `Gemfile` and `fastlane/Fastfile` at the application repository root.
- Use `scripts/patch-android-release-signing.mjs` after prebuild for release signing and CI version codes.

## Build choices

The generated workflow has two manual options:

- `debug-apk`: build and upload an installable APK.
- `production`: sign an AAB, upload it as a workflow artifact, and (if enabled) deploy it to Google Play.

Pushes to `main` and pull requests build only the debug APK. Production is a manual workflow dispatch.

## Secrets

Production requires `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`. Play deployment additionally requires `PLAY_STORE_JSON_BASE64`. If app.json configures `android.googleServicesFile`, provide the matching `GOOGLE_SERVICES_JSON_BASE64` secret.

Do not commit keystores, Google service-account keys, or the locally generated Android project.

## Upgrade existing repositories

Run `android-ci init` with the app repository as `--target`. Back up or rename an existing `.github/workflows/android-ci.yml` first; init writes the generated workflow at that path. Existing root Fastlane files and Gemfile are left unchanged when already present.
