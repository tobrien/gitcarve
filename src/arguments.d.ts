export interface Input {
    commandName: string;
    dryRun?: boolean;
    verbose?: boolean;
    debug?: boolean;
    overrides?: boolean;
    openaiApiKey?: string;
    model?: string;
    contextDirectories?: string[];
    instructions?: string;
    configDir?: string;
    cached?: boolean;
    sendit?: boolean;
    fromCommitAlias: string;
    toCommitAlias: string;
    version?: string;
}
