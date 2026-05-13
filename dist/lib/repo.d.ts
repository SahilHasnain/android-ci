export interface RepoConfig {
    targetRoot: string;
    androidProjectPath: string | null;
    workflowDir: string;
    infraDir: string;
}
export declare function detectRepoConfig(targetRoot: string): Promise<RepoConfig>;
