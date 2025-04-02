import { DEFAULT_DRY_RUN, DEFAULT_VERBOSE } from "./constants";

export interface Config {
    dryRun: boolean;
    verbose: boolean;
}

export const createConfig = (params: {
    dryRun?: boolean;
    verbose?: boolean;
}): Config => {
    return {
        dryRun: params.dryRun ?? DEFAULT_DRY_RUN,
        verbose: params.verbose ?? DEFAULT_VERBOSE,
    }
}