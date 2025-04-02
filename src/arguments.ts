import { Command } from "commander";
import { Input } from "./arguments.d";
import { DEFAULT_DRY_RUN, DEFAULT_VERBOSE, PROGRAM_NAME, VERSION } from "./constants";
import * as Run from "./run";

export const configure = (program: Command) => {
    program
        .name(PROGRAM_NAME)
        .summary('Create Intelligent Release Notes or Change Logs from Git')
        .description('Create Intelligent Release Notes or Change Logs from Git')
        .option('--dry-run', 'perform a dry run without saving files', DEFAULT_DRY_RUN)
        .option('--verbose', 'enable debug logging', DEFAULT_VERBOSE)
        .version(VERSION);
}

export const generateConfig = async (options: Input): Promise<[Run.Config]> => {

    // Create the run configuration
    const runConfig = Run.createConfig({
        dryRun: options.dryRun,
        verbose: options.verbose,
    });

    return [runConfig];
}