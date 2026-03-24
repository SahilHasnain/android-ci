#!/usr/bin/env node

import process from "node:process";
import { blue, bold, cyan, red, yellow } from "kleur/colors";
import { runDoctorCommand } from "./commands/doctor.js";
import { runInitCommand } from "./commands/init.js";

function printHelp(): void {
  console.log(bold("android-ci"));
  console.log("Reusable Android CI/CD scaffolder");
  console.log("");
  console.log("Commands:");
  console.log(`  ${cyan("init")}      Scaffold Android CI/CD foundation`);
  console.log(`  ${cyan("doctor")}    Planned`);
  console.log(`  ${cyan("migrate")}   Planned`);
  console.log(`  ${cyan("upgrade")}   Planned`);
  console.log("");
  console.log("Examples:");
  console.log(`  ${blue("android-ci init")}`);
  console.log(`  ${blue("android-ci init --target .")}`);
  console.log(`  ${blue("android-ci init --target . --no-prompt true")}`);
}

async function main(): Promise<void> {
  const [, , command = "help", ...args] = process.argv;

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "init") {
    await runInitCommand(args);
    return;
  }

  if (command === "doctor") {
    await runDoctorCommand(args);
    return;
  }

  if (command === "migrate" || command === "upgrade") {
    console.log(yellow(`Command "${command}" is not implemented yet.`));
    return;
  }

  console.error(red(`Unknown command: ${command}`));
  printHelp();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(red("android-ci failed"));
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
