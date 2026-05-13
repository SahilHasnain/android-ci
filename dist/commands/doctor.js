import path from "node:path";
import process from "node:process";
import { cyan, green, red, yellow } from "kleur/colors";
import { fileExists, parseArgs, readJsonFile } from "../lib/fs.js";
import { detectRepoConfig } from "../lib/repo.js";
export async function runDoctorCommand(argv) {
    const args = parseArgs(argv);
    const target = path.resolve(args.target ?? process.cwd());
    const config = await detectRepoConfig(target);
    console.log(cyan(`Target: ${target}`));
    console.log(cyan(`Android project: ${config.androidProjectPath ?? "not found"}`));
    const checks = [
        {
            label: "package.json",
            ok: await fileExists(path.join(target, "package.json")),
        },
        {
            label: "android project",
            ok: config.androidProjectPath !== null,
        },
        {
            label: ".github/workflows",
            ok: await fileExists(path.join(target, ".github", "workflows")),
        },
    ];
    for (const check of checks) {
        console.log(check.ok ? green(`OK  ${check.label}`) : red(`MISS ${check.label}`));
    }
    if (await fileExists(path.join(target, "package.json"))) {
        const pkg = await readJsonFile(path.join(target, "package.json"));
        console.log(yellow(`Repo package name: ${pkg.name ?? "unknown"}`));
    }
    if (!config.androidProjectPath) {
        console.log(yellow("No supported Android project detected. Expected android/ or apps/mobile/android."));
    }
}
