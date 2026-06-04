import fs from "node:fs/promises";

export async function ensureDirectory(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function writeFileSafe(
  filePath: string,
  content: string,
): Promise<void> {
  await fs.writeFile(filePath, content, "utf8");
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export function parseArgs(argv: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      parsed[key] = "true";
      continue;
    }

    parsed[key] = value;
    i += 1;
  }

  return parsed;
}

export async function readFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, "utf8");
}

export async function patchBuildGradle(buildGradlePath: string): Promise<boolean> {
  try {
    const content = await readFile(buildGradlePath);
    
    // Check if already has release signing config
    if (content.includes('release {') && 
        content.includes('System.getenv("ANDROID_KEYSTORE_PATH")') &&
        content.includes('signingConfigs.release')) {
      return false; // Already patched
    }
    
    // Pattern to match the signingConfigs block
    const signingConfigsPattern = /(signingConfigs\s*\{[\s\S]*?debug\s*\{[\s\S]*?\}[\s\S]*?)\}/m;
    
    // Pattern to match the release buildType with debug signing config
    const releaseBuildTypePattern = /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)(signingConfig\s+signingConfigs\.debug)/m;
    
    let modified = content;
    let hasChanges = false;
    
    // Add release signing config if not present
    if (!content.includes('release {') || !content.includes('storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))')) {
      modified = modified.replace(signingConfigsPattern, (match, beforeClosing) => {
        hasChanges = true;
        return `${beforeClosing}
        release {
            if (System.getenv("ANDROID_KEYSTORE_PATH")) {
                storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))
                storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias System.getenv("ANDROID_KEY_ALIAS")
                keyPassword System.getenv("ANDROID_KEY_PASSWORD")
            }
        }
    }`;
      });
    }
    
    // Update release buildType to use release signing config
    if (releaseBuildTypePattern.test(modified)) {
      modified = modified.replace(releaseBuildTypePattern, (match, beforeSigning, signingConfigLine) => {
        hasChanges = true;
        return `${beforeSigning}// Use release signing config if available, otherwise fall back to debug
            signingConfig System.getenv("ANDROID_KEYSTORE_PATH") ? signingConfigs.release : signingConfigs.debug`;
      });
    }
    
    if (hasChanges) {
      await fs.writeFile(buildGradlePath, modified, "utf8");
      return true;
    }
    
    return false;
  } catch (error) {
    throw new Error(`Failed to patch build.gradle: ${error instanceof Error ? error.message : String(error)}`);
  }
}
