import { DEFAULT_CACHED, DEFAULT_COMMAND, DEFAULT_CONFIG_DIR, DEFAULT_CONTENT_TYPES, DEFAULT_CONTEXT_DIRECTORIES, DEFAULT_DEBUG, DEFAULT_DIFF, DEFAULT_DRY_RUN, DEFAULT_INSTRUCTIONS_DIR, DEFAULT_LOG, DEFAULT_MODEL, DEFAULT_OVERRIDES, DEFAULT_SENDIT_MODE, DEFAULT_VERBOSE } from "./constants";

export interface Config {
    dryRun: boolean;
    verbose: boolean;
    debug: boolean;
    overrides: boolean;
    contentTypes: string[];
    instructions: string;
    model: string;
    contextDirectories: string[];
    commandName: string;
    configDir: string;
    cached?: boolean;
    sendit: boolean;
}

export const createConfig = (params: {
    dryRun?: boolean;
    verbose?: boolean;
    debug?: boolean;
    overrides?: boolean;
    contentTypes?: string[];
    instructions?: string;
    model?: string;
    contextDirectories?: string[];
    commandName?: string;
    configDir?: string;
    cached?: boolean;
    sendit?: boolean;
}): Config => {
    return {
        dryRun: params.dryRun ?? DEFAULT_DRY_RUN,
        verbose: params.verbose ?? DEFAULT_VERBOSE,
        debug: params.debug ?? DEFAULT_DEBUG,
        overrides: params.overrides ?? DEFAULT_OVERRIDES,
        contentTypes: params.contentTypes ?? DEFAULT_CONTENT_TYPES,
        instructions: params.instructions ?? DEFAULT_INSTRUCTIONS_DIR,
        model: params.model ?? DEFAULT_MODEL,
        contextDirectories: params.contextDirectories ?? DEFAULT_CONTEXT_DIRECTORIES,
        commandName: params.commandName ?? DEFAULT_COMMAND,
        configDir: params.configDir ?? DEFAULT_CONFIG_DIR,
        cached: params.cached,
        sendit: params.sendit ?? DEFAULT_SENDIT_MODE,
    }
}