import { DEFAULT_DIFF, DEFAULT_DRY_RUN, DEFAULT_LOG, DEFAULT_VERBOSE } from "./constants";

export interface Config {
    dryRun: boolean;
    verbose: boolean;
    diff: boolean;
    log: boolean;
}

export const createConfig = (params: {
    dryRun?: boolean;
    verbose?: boolean;
    diff?: boolean;
    log?: boolean;
}): Config => {
    return {
        dryRun: params.dryRun ?? DEFAULT_DRY_RUN,
        verbose: params.verbose ?? DEFAULT_VERBOSE,
        diff: params.diff ?? DEFAULT_DIFF,
        log: params.log ?? DEFAULT_LOG,
    }
}