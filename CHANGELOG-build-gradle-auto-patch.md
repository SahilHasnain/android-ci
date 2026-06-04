# Build.gradle Auto-Patching Feature

## Summary

Added automatic build.gradle patching to the `android-ci init` command. When initializing a project, the tool now automatically updates `android/app/build.gradle` to use release keystore configuration from environment variables.

## Changes Made

### 1. New Function: `patchBuildGradle()` in `src/lib/fs.ts`

- Automatically detects and patches build.gradle files
- Adds release signing config block if missing
- Updates release buildType to use release signing config with fallback to debug
- Idempotent: safely skips if already patched
- Provides clear error messages if patching fails

### 2. Updated `runInitCommand()` in `src/commands/init.ts`

- Calls `patchBuildGradle()` after generating workflow files
- Provides user feedback on patch status:
  - Success: "Updated android/app/build.gradle to use release keystore"
  - Already patched: "android/app/build.gradle already configured for release keystore"
  - Error: Warning with fallback to manual configuration

### 3. Updated README Template in `src/templates/android.ts`

- Changed wording from "Ensure your build.gradle is configured" to "Your build.gradle has been automatically configured"
- Clarifies that the configuration is done during initialization

## What Gets Patched

### Before:
```groovy
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.debug  // ❌ Using debug keystore
    }
}
```

### After:
```groovy
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        if (System.getenv("ANDROID_KEYSTORE_PATH")) {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }
    }
}
buildTypes {
    release {
        // Use release signing config if available, otherwise fall back to debug
        signingConfig System.getenv("ANDROID_KEYSTORE_PATH") ? signingConfigs.release : signingConfigs.debug  // ✅ Using release keystore
    }
}
```

## Benefits

1. **Eliminates manual configuration**: No need to manually edit build.gradle
2. **Prevents common mistakes**: Automatically fixes the "wrong key" Play Store error
3. **Safe and idempotent**: Won't break existing configurations
4. **Clear feedback**: Users know exactly what happened
5. **Graceful degradation**: Falls back to manual instructions if auto-patch fails

## Testing

Tested with regex patterns to ensure:
- Correct identification of signingConfigs block
- Proper insertion of release signing config
- Accurate replacement of debug signing config in release buildType
- No modification of debug buildType

## Backward Compatibility

- Existing projects already configured will not be modified (idempotent check)
- If patching fails, users get clear instructions to configure manually
- No breaking changes to existing workflows
