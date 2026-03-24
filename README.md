# android-ci

Reusable CLI for setting up Android CI/CD in app repositories.

## Commands

- `android-ci init`
- `android-ci doctor`
- `android-ci migrate` planned
- `android-ci upgrade` planned

## What `init` Generates

- `.github/workflows/android-self-hosted.yml`
- `infra/android-ci/README.md`

This tool is optimized for teams using one shared self-hosted Android VM across multiple repos.
It generates the per-project integration layer, not full VM ownership per repo.

For the base machine setup, use [SHARED_VM_SETUP.md](./SHARED_VM_SETUP.md).

## Interactive Usage

Run `init` without flags and it will prompt for missing values:

```bash
npm install
npm run dev -- init --target ../my-app
```

It will ask for:

- Android project path
- default app variant
- runner label
- Android application id
- keystore path on runner
- whether Play deploy is enabled
- whether Sentry is enabled

## Non-Interactive Usage

If you want to script it, pass flags:

```bash
npm run dev -- init \
  --target ../my-app \
  --no-prompt true \
  --android-project-path apps/mobile/android \
  --app-variant production \
  --runner-label android-do \
  --android-application-id com.example.app \
  --keystore-path /home/runner/android-secrets/release.keystore \
  --enable-play-deploy true \
  --enable-sentry true
```

## Generated Workflow Expectations

The generated workflow expects a self-hosted Linux runner and typically uses:

- runner label such as `android-do`
- tracked Android project under `android/` or `apps/mobile/android`
- a release keystore available on the shared VM filesystem
- optionally a shared Play service-account JSON available on the shared VM filesystem

## GitHub Secrets

Typical required secrets:

- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `SENTRY_AUTH_TOKEN`

## GitHub Variables

Common optional overrides:

- `ANDROID_APPLICATION_ID`
- `ANDROID_KEYSTORE_PATH`
- `PLAY_STORE_JSON_KEY_PATH`
- `PLAY_TRACK`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

If your app uses env-based configuration, define the needed repository variables and expose them in the workflow. This tool does not yet infer app-specific env keys automatically.

## Dev

```bash
npm install
npm run check
npm run dev -- init --target ../my-app
```
