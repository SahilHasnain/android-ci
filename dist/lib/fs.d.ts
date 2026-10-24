export declare function ensureDirectory(dir: string): Promise<void>;
export declare function fileExists(filePath: string): Promise<boolean>;
export declare function writeFileSafe(filePath: string, content: string): Promise<void>;
export declare function readJsonFile<T>(filePath: string): Promise<T>;
export declare function parseArgs(argv: string[]): Record<string, string>;
