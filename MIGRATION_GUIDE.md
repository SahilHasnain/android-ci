# Migration Guide: Self-Hosted to GitHub-Hosted Runners

This guide helps you migrate from self-hosted runners to GitHub-hosted runners.

## Why Migrate?

**Self-Hosted Issues:**
- VM setup complexity
- Resource management (RAM, CPU)
- Maintenance overhead
- Freezing/crashing on resource-constrained VMs

**GitHub-Hosted Benefits:**
- ✅ Zero setup
- ✅ Fast, reliable builds
- ✅ No VM maintenance
- ✅ Automatic scaling
- ✅ Built-in caching

## Migration Steps

### 1. Encode Your Secrets

```bash
# Encode your Android keystore
base64 -w 0 /path/to/release.keystore > keystore-base64.txt

# Encode your Play Store service account JSON
base64 -w 0 /path/to/play-store-key.json > playstore-base64.txt
```

### 2. Add GitHub Secrets

Go to your repository: `Settings → Secrets and variables → Actions`

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `ANDROID_KEYSTORE_BASE64` | Contents of `keystore-base64.txt` |
| `PLAY_STORE_JSON_BASE64` | Contents of `playstore-base64.txt` |
| `ANDROID_KEYSTORE_PASSWORD` | Your keystore password |
| `ANDROID_KEY_ALIAS` | Your key alias |
| `ANDROID_KEY_PASSWORD` | Your key password |
| `SENTRY_AUTH_TOKEN` | Your Sentry token (if using Sentry) |

### 3. Regenerate Workflow

```bash
# In your android-ci repo
npm install
npm run dev -- init --target ../your-app --use-github-hosted true
```

Or manually update your workflow:

**Change:**
```yaml
runs-on: [self-hosted, linux, x64, android-do]
env:
  ANDROID_SDK_ROOT: /opt/android-sdk
  JAVA_HOME: /usr/lib/jvm/java-17-openjdk-amd64
```

**To:**
```yaml
runs-on: ubuntu-latest
env:
  ANDROID_SDK_ROOT: /usr/local/lib/android/sdk
  JAVA_HOME: /usr/lib/jvm/temurin-17-jdk-amd64
```

**Add decode steps before build:**
```yaml
- name: Decode keystore
  run: |
    echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > /tmp/release.keystore

- name: Decode Play Store JSON
  if: ${{ env.APP_VARIANT == 'production' }}
  run: |
    echo "${{ secrets.PLAY_STORE_JSON_BASE64 }}" | base64 -d > /tmp/play-store-key.json
```

**Update keystore paths:**
```yaml
env:
  ANDROID_KEYSTORE_PATH: /tmp/release.keystore  # was /home/runner/android-secrets/...
  SUPPLY_JSON_KEY: /tmp/play-store-key.json     # was /home/Sahilhasnain/android-secrets/...
```

### 4. Add Caching (Optional but Recommended)

```yaml
- name: Setup Gradle cache
  uses: actions/cache@v4
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
      ~/.android/build-cache
    key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
    restore-keys: |
      ${{ runner.os }}-gradle-

- name: Cache NDK
  uses: actions/cache@v4
  with:
    path: |
      apps/mobile/android/app/.cxx
      apps/mobile/android/.gradle
    key: ${{ runner.os }}-ndk-${{ hashFiles('apps/mobile/android/**/*.gradle*') }}
    restore-keys: |
      ${{ runner.os }}-ndk-
```

### 5. Test the Workflow

1. Commit and push changes
2. Go to Actions tab
3. Run the workflow manually
4. First build: ~15-20 minutes (building cache)
5. Subsequent builds: ~5-10 minutes (using cache)

### 6. Decommission Self-Hosted Runner (Optional)

Once GitHub-hosted builds are working:

1. Go to repository Settings → Actions → Runners
2. Remove the self-hosted runner
3. Shut down your VM

## Troubleshooting

### Build fails with "keystore not found"

- Verify `ANDROID_KEYSTORE_BASE64` secret is set correctly
- Check the base64 encoding has no newlines: `base64 -w 0`

### Build fails with "Play Store JSON invalid"

- Verify `PLAY_STORE_JSON_BASE64` secret is set correctly
- Test decoding locally: `echo "YOUR_BASE64" | base64 -d | jq .`

### Builds are slow

- First build is always slow (building cache)
- Ensure caching steps are added
- Check if building for multiple architectures (use only `arm64-v8a` for faster builds)

## Cost Comparison

| Runner Type | Setup Time | Build Time | Monthly Cost* |
|-------------|------------|------------|---------------|
| Self-Hosted VM | 2-4 hours | 20-60 min | $12-50 (VM) |
| GitHub-Hosted | 0 minutes | 10-15 min | $0-8 (usage) |

*Assuming 20 builds/month. GitHub-hosted is free for public repos.

## Rollback

If you need to rollback to self-hosted:

```bash
npm run dev -- init --target ../your-app --use-github-hosted false
```

Then restore your VM and runner configuration.
