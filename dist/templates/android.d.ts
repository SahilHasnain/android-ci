import { workflowTemplate } from "./workflow.template.js";
import { fastfileTemplate } from "./fastfile.template.js";
interface ReadmeTemplateOptions {
    androidProjectPath: string;
    androidApplicationId: string;
    enablePlayDeploy: boolean;
}
export declare function renderGitHubWorkflow(options: Parameters<typeof workflowTemplate>[0]): string;
export declare function renderFastfile(options: Parameters<typeof fastfileTemplate>[0]): string;
export declare function renderGemfile(): string;
export declare function renderReadme(options: ReadmeTemplateOptions): string;
export {};
