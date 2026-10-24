import path from "node:path";
import { fileExists } from "./fs.js";
export async function detectRepoConfig(targetRoot) {
    const androidRoot = path.join(targetRoot, "android");
    const mobileAndroidRoot = path.join(targetRoot, "apps", "mobile", "android");
    const expoAppConfig = path.join(targetRoot, "app.json");
    const hasAndroidRoot = await fileExists(androidRoot);
    const hasMobileAndroidRoot = await fileExists(mobileAndroidRoot);
    const hasExpoAppConfig = await fileExists(expoAppConfig);
    return {
        targetRoot,
        androidProjectPath: hasMobileAndroidRoot
            ? "apps/mobile/android"
            : hasAndroidRoot
                ? "android"
                : hasExpoAppConfig
                    ? "android"
                    : null,
        workflowDir: path.join(targetRoot, ".github", "workflows"),
        infraDir: path.join(targetRoot, "infra", "android-ci"),
    };
}
