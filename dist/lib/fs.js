import fs from "node:fs/promises";
export async function ensureDirectory(dir) {
    await fs.mkdir(dir, { recursive: true });
}
export async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
export async function writeFileSafe(filePath, content) {
    await fs.writeFile(filePath, content, "utf8");
}
export async function readJsonFile(filePath) {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
}
export function parseArgs(argv) {
    const parsed = {};
    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        if (!token.startsWith("--"))
            continue;
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
