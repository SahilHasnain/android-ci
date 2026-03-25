# Shared Android VM Setup

This document is the canonical base setup for one shared self-hosted Android build VM used by multiple repositories.

## VM Baseline

- Ubuntu 24.04 recommended
- 4 vCPU minimum
- 8 GB RAM minimum
- 80+ GB disk recommended
- static public IP preferred

## Install Base Dependencies

Install:

- Git
- Node.js
- npm
- Ruby
- Java 17
- Android SDK command-line tools
- platform-tools
- required Android platforms/build-tools
- required NDK versions

Core conventions:

- Android SDK root: `/opt/android-sdk`
- GitHub Actions tool cache: `/opt/hostedtoolcache`

## Permissions

Make sure the runner user can write to:

- `/opt/android-sdk`
- `/opt/hostedtoolcache`

Typical fixes:

```bash
sudo mkdir -p /opt/hostedtoolcache
sudo chown -R $USER:$USER /opt/hostedtoolcache
sudo chown -R $USER:$USER /opt/android-sdk
```

## GitHub Runner

Install one self-hosted Linux x64 runner on the VM.

Recommended labels:

- `self-hosted`
- `linux`
- `x64`
- one custom routing label such as `android-do`

## Runner Lifecycle

Do not rely on an SSH shell staying open.

Run the runner using one of:

- `tmux`
- `screen`
- `systemd` service

Recommended long-term option: `systemd`.

## Secret Files on VM

Store shared secret files outside any repo checkout.

Recommended location:

```text
/home/Sahilhasnain/android-secrets
```

Recommended files:

- `/home/Sahilhasnain/android-secrets/<project>/release.keystore`
- `/home/Sahilhasnain/android-secrets/play-store-key.json`

If your Android keystore file already exists in a repo root as a `.jks` file, copy it to the VM with SSH:

```powershell
ssh -i .\ssh_key Sahilhasnain@98.70.32.91 "mkdir -p /home/Sahilhasnain/android-secrets && chmod 700 /home/Sahilhasnain/android-secrets"
scp -i .\ssh_key ".\your-release-key.jks" Sahilhasnain@98.70.32.91:/home/Sahilhasnain/android-secrets/release.keystore
```

Recommended per-project version:

```powershell
ssh -i .\ssh_key Sahilhasnain@98.70.32.91 "mkdir -p /home/Sahilhasnain/android-secrets/your-project && chmod 700 /home/Sahilhasnain/android-secrets/your-project"
scp -i .\ssh_key ".\your-release-key.jks" Sahilhasnain@98.70.32.91:/home/Sahilhasnain/android-secrets/your-project/release.keystore
```

If you are not in the repo root, use the absolute local path instead of `.\your-release-key.jks`.

Recommended permissions:

```bash
mkdir -p /home/Sahilhasnain/android-secrets
chmod 700 /home/Sahilhasnain/android-secrets
chmod 600 /home/Sahilhasnain/android-secrets/*
```

## Per-Repo Expectations

Each repo should provide:

- its own workflow
- repo-level GitHub secrets for passwords/tokens
- repo-level GitHub variables for optional overrides

Each repo should not:

- own the Android SDK install
- decode large key files from base64 if the VM already stores them safely
- redefine the whole VM bootstrap process

## Typical Repo Secrets

- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `SENTRY_AUTH_TOKEN`

## Typical Repo Variables

- `ANDROID_APPLICATION_ID`
- `ANDROID_KEYSTORE_PATH`
- `PLAY_STORE_JSON_KEY_PATH`
- `PLAY_TRACK`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

## Troubleshooting

If a workflow is queued forever:

- verify the runner is online
- verify labels match exactly
- verify the runner process is still listening

If Android SDK is not found:

- verify `/opt/android-sdk` exists
- verify `local.properties` points to it
- verify the runner user can read and write it

If Gradle cannot install SDK/NDK components:

- fix ownership of `/opt/android-sdk`

If `gradlew` is not executable:

- `chmod +x gradlew`

If signing fails with keystore parse errors:

- stop base64 decoding in CI
- use the real keystore file stored on the VM

If Play upload fails because JSON is invalid:

- stop base64 decoding in CI
- use the real JSON file stored on the VM
