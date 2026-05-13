interface WorkflowTemplateOptions {
    androidProjectPath: string;
    appVariant: "development" | "preview" | "production";
    runnerLabel: string;
    androidApplicationId: string;
    keystorePath: string;
    enablePlayDeploy: boolean;
    enableSentry: boolean;
    useGitHubHosted?: boolean;
}
export declare function workflowTemplate(options: WorkflowTemplateOptions): string;
export {};
