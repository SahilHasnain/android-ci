# android-ci

Reusable CLI for setting up Android CI/CD in app repositories.

**Now supports GitHub-hosted runners by default!** No more VM setup headaches.

## Commands

- `android-ci init`
- `android-ci doctor`
- `android-ci migrate` planned
- `android-ci upgrade` planned

## What `init` Generates

- `.github/workflows/android-self-hosted.yml`
- `infra/android-ci/README.md`

## Runner Options

### GitHub-Hosted Runners (Default & Recommended)

- ✅ No setup required
- ✅ Fast builds (10-15 minutes)
- ✅ Always up-to-date
- ✅ Automatic caching
- ✅ Secrets stored as base64 in GitHub

**Required GitHub Secrets:**
- `ANDROID_KEYSTORE_BASE64` - Base64 encoded keystore file
- `PLAY_STORE_JSON_BASE64` - Base64 encoded Play Store service account JSON
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `SENTRY_AUTH_TOKEN` (optional)

**To encode your secrets:**

Use the provided helper scripts:

**Linux/macOS:**
```bash
# Encode both keystore and Play Store JSON
./scripts/encode-secrets.sh path/to/release.keystore path/to/play-store-key.json

# Or just keystore
./scripts/encode-secrets.sh path/to/release.keystore
```

**Windows (PowerShell):**
```powershell
# Encode both keystore and Play Store JSON
.\scripts\encode-secrets.ps1 path\to\release.keystore path\to\play-store-key.json

# Or just keystore
.\scripts\encode-secrets.ps1 path\to\release.keystore
```

**Manual encoding (if needed):**
```bash
# Linux/macOS
base64 -w 0 path/to/release.keystore

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\release.keystore"))
```

### Self-Hosted Runners (Legacy)

For teams using one shared self-hosted Android VM across multiple repos.
Set `--use-github-hosted false` during init.

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
- runner label (only for self-hosted)
- Android application id
- keystore path on runner (only for self-hosted)
- whether Play deploy is enabled
- whether Sentry is enabled
- **whether to use GitHub-hosted runners (recommended)**

## Non-Interactive Usage

### GitHub-Hosted (Recommended)

```bash
npm run dev -- init \
  --target ../my-app \
  --no-prompt true \
  --android-project-path apps/mobile/android \
  --app-variant production \
  --android-application-id com.example.app \
  --enable-play-deploy true \
  --enable-sentry true \
  --use-github-hosted true
```

### Self-Hosted (Legacy)

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
  --enable-sentry true \
  --use-github-hosted false
```

## Generated Workflow Expectations

The generated workflow expects a self-hosted Linux runner and typically uses:

- runner label such as `android-do`
- tracked Android project under `android/` or `apps/mobile/android`
- a project-specific release keystore available on the shared VM filesystem
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

Recommended VM file layout:

- per-project keystore:
  - `/home/Sahilhasnain/android-secrets/<project>/release.keystore`
- shared Play key:
  - `/home/Sahilhasnain/android-secrets/play-store-key.json`

## Helper Scripts

### Encode Secrets

Located in `scripts/` directory:

- `encode-secrets.sh` - Bash script for Linux/macOS
- `encode-secrets.ps1` - PowerShell script for Windows

These scripts help you encode your Android keystore and Play Store JSON files to base64 format required by GitHub Actions.

**Usage:**
```bash
# Linux/macOS
./scripts/encode-secrets.sh release.keystore play-store-key.json

# Windows
.\scripts\encode-secrets.ps1 release.keystore play-store-key.json
```

The scripts will output the base64-encoded values that you can copy directly to your GitHub repository secrets.

## Dev

```bash
npm install
npm run check
npm run dev -- init --target ../my-app
```
