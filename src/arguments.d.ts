export interface Input {
    dryRun: boolean;
    verbose: boolean;
    debug: boolean;
    model: string;
    openaiApiKey: string;
    contentTypes: string[];
    instructions: string;
}

