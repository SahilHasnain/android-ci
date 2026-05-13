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
import { renderGitHubWorkflow, renderReadme } from "../templates/android.js";

export async function runInitCommand(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  const target = path.resolve(args.target ?? process.cwd());
  const config = await detectRepoConfig(target);
  const projectSlug = path.basename(target);
  const defaultKeystorePath = `/home/Sahilhasnain/android-secrets/${projectSlug}/release.keystore`;
  const isInteractive = args["no-prompt"] !== "true";
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
  const runnerLabel = args["runner-label"]
    ?? (isInteractive
      ? await promptText("Runner label", {
          defaultValue: "android-do",
          required: true,
        })
      : "android-do");
  const androidApplicationId = args["android-application-id"]
    ?? (isInteractive
      ? await promptText("Android application id", {
          defaultValue: "com.example.app",
          required: true,
        })
      : "com.example.app");
  const keystorePath = args["keystore-path"]
    ?? (isInteractive
      ? await promptText("Keystore path on runner", {
          defaultValue: defaultKeystorePath,
          required: true,
        })
      : defaultKeystorePath);
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
  
  const useGitHubHosted = args["use-github-hosted"]
    ? args["use-github-hosted"] !== "false"
    : isInteractive
      ? await promptBoolean("Use GitHub-hosted runners (recommended)", true)
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
    }),
  );

  console.log(green("Scaffolded Android CI foundation."));
  console.log(
    green(
      "Next: add secrets, verify runner labels, and customize the generated workflow.",
    ),
  );
}
