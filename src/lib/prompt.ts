import readline from "node:readline/promises";
import process from "node:process";

type PromptOptions = {
  defaultValue?: string;
  required?: boolean;
};

export async function promptText(
  label: string,
  options: PromptOptions = {},
): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      const suffix = options.defaultValue ? ` (${options.defaultValue})` : "";
      const answer = (await rl.question(`${label}${suffix}: `)).trim();
      const value = answer || options.defaultValue || "";

      if (!options.required || value) {
        return value;
      }
    }
  } finally {
    rl.close();
  }
}

export async function promptBoolean(
  label: string,
  defaultValue: boolean,
): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      const hint = defaultValue ? "Y/n" : "y/N";
      const answer = (await rl.question(`${label} (${hint}): `))
        .trim()
        .toLowerCase();

      if (!answer) return defaultValue;
      if (answer === "y" || answer === "yes") return true;
      if (answer === "n" || answer === "no") return false;
    }
  } finally {
    rl.close();
  }
}
