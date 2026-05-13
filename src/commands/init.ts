import path from "node:path";
import process from "node:process";
import { cyan, green, yellow } from "kleur/colors";
import {
  ensureDirectory,
  parseArgs,
  writeFileSafe,
} from "../lib/fs.js";
import { promptBoolean, promptText } from "../lib/prompt.js";
import { detectRepoConfig } from "../lib/repo.js";
import { renderGitHubWorkflow, renderReadme, renderFastfile } from "../templates/android.js";

export async function runInitCommand(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  const target = path.resolve(args.target ?? process.cwd());
  const config = await detectRepoConfig(target);
  const projectSlug = path.basename(target);
  const defaultKeystorePath = `/home/Sahilhasnain/android-secrets/${projectSlug}/release.keystore`;
  const isInteractive = args["no-prompt"] !== "true";
  // Ask about GitHub-hosted first
  const useGitHubHosted = args["use-github-hosted"]
    ? args["use-github-hosted"] !== "false"
    : isInteractive
      ? await promptBoolean("Use GitHub-hosted runners (recommended)", true)
      : true;

  const androidProjectPath = args["android-project-path"]
    ?? (isInteractive
      ? await promptText("Android project path", {
          defaultValue: config.androidProjectPath ?? "android",
          required: true,
        })
      : config.androidProjectPath ?? "android");
  const appVariant = (args["app-variant"] as
    | "development"
    | "preview"
    | "production"
    | undefined)
    ?? (isInteractive
      ? (await promptText("Default app variant", {
          defaultValue: "production",
          required: true,
        }) as "development" | "preview" | "production")
      : "production");
  
  // Only ask for runner label and keystore path if using self-hosted
  const runnerLabel = !useGitHubHosted
    ? (args["runner-label"]
      ?? (isInteractive
        ? await promptText("Runner label", {
            defaultValue: "android-do",
            required: true,
          })
        : "android-do"))
    : "android-do"; // Default value for template, won't be used
  
  const androidApplicationId = args["android-application-id"]
    ?? (isInteractive
      ? await promptText("Android application id", {
          defaultValue: "com.example.app",
          required: true,
        })
      : "com.example.app");
  
  const keystorePath = !useGitHubHosted
    ? (args["keystore-path"]
      ?? (isInteractive
        ? await promptText("Keystore path on runner", {
            defaultValue: defaultKeystorePath,
            required: true,
          })
        : defaultKeystorePath))
    : defaultKeystorePath; // Default value for template, won't be used
  
  const enablePlayDeploy = args["enable-play-deploy"]
    ? args["enable-play-deploy"] !== "false"
    : isInteractive
      ? await promptBoolean("Enable Play deploy", true)
      : true;
  const enableSentry = args["enable-sentry"]
    ? args["enable-sentry"] !== "false"
    : isInteractive
      ? await promptBoolean("Enable Sentry", true)
      : true;

  console.log(cyan(`Target: ${target}`));

  if (!config.androidProjectPath) {
    console.log(
      yellow(
        "No android project detected. Proceeding with generic templates only.",
      ),
    );
  }

  await ensureDirectory(config.workflowDir);
  await ensureDirectory(config.infraDir);

  await writeFileSafe(
    path.join(config.workflowDir, "android-self-hosted.yml"),
    renderGitHubWorkflow({
      androidProjectPath,
      appVariant,
      runnerLabel,
      androidApplicationId,
      keystorePath,
      enablePlayDeploy,
      enableSentry,
      useGitHubHosted,
    }),
  );

  await writeFileSafe(
    path.join(config.infraDir, "README.md"),
    renderReadme({
      androidProjectPath,
      runnerLabel,
      androidApplicationId,
      keystorePath,
      enablePlayDeploy,
      enableSentry,
      useGitHubHosted,
    }),
  );

  // Copy encoding scripts if using GitHub-hosted
  if (useGitHubHosted) {
    const scriptsDir = path.join(config.infraDir, "scripts");
    await ensureDirectory(scriptsDir);
    
    // Copy bash script
    const bashScriptSource = path.join(
      path.dirname(new URL(import.meta.url).pathname),
      "..",
      "..",
      "scripts",
      "encode-secrets.sh"
    );
    const bashScriptDest = path.join(scriptsDir, "encode-secrets.sh");
    
    // Copy PowerShell script
    const ps1ScriptSource = path.join(
      path.dirname(new URL(import.meta.url).pathname),
      "..",
      "..",
      "scripts",
      "encode-secrets.ps1"
    );
    const ps1ScriptDest = path.join(scriptsDir, "encode-secrets.ps1");
    
    try {
      const fs = await import("node:fs/promises");
      await fs.copyFile(bashScriptSource, bashScriptDest);
      await fs.copyFile(ps1ScriptSource, ps1ScriptDest);
      console.log(green("Copied encoding helper scripts to infra/android-ci/scripts/"));
    } catch (err) {
      console.log(yellow("Warning: Could not copy encoding scripts. You can find them in the android-ci repository."));
    }
  }

  // Generate Fastfile if Play deploy is enabled
  if (enablePlayDeploy && config.androidProjectPath) {
    const fastlaneDir = path.join(target, androidProjectPath, "fastlane");
    const fastfilePath = path.join(fastlaneDir, "Fastfile");
    
    try {
      const fs = await import("node:fs/promises");
      await fs.access(fastfilePath);
      console.log(yellow("Fastfile already exists, skipping generation. Review it to ensure it matches the workflow expectations."));
    } catch {
      // Fastfile doesn't exist, create it
      await ensureDirectory(fastlaneDir);
      await writeFileSafe(
        fastfilePath,
        renderFastfile({
          androidApplicationId,
          enableSentry,
        }),
      );
      console.log(green("Generated Fastfile at android/fastlane/Fastfile"));
    }
  }

  console.log(green("Scaffolded Android CI foundation."));
  console.log(
    green(
      "Next: add secrets, verify runner labels, and customize the generated workflow.",
    ),
  );
}
