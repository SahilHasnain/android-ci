type PromptOptions = {
    defaultValue?: string;
    required?: boolean;
};
export declare function promptText(label: string, options?: PromptOptions): Promise<string>;
export declare function promptBoolean(label: string, defaultValue: boolean): Promise<boolean>;
export {};
