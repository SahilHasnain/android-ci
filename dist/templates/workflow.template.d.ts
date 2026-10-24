interface WorkflowTemplateOptions {
    androidProjectPath: string;
    androidApplicationId: string;
    enablePlayDeploy: boolean;
}
export declare function workflowTemplate(options: WorkflowTemplateOptions): string;
export {};
