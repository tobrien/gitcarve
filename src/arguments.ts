import { Command } from "commander";
import { Input } from "./arguments.d";
import { DEFAULT_DIFF, DEFAULT_DRY_RUN, DEFAULT_LOG, DEFAULT_VERBOSE, PROGRAM_NAME, VERSION } from "./constants";
import * as Run from "./run";

export const configure = (): [Run.Config] => {
    const program = new Command();

    program
        .name(PROGRAM_NAME)
        .summary('Create Intelligent Release Notes or Change Logs from Git')
        .description('Create Intelligent Release Notes or Change Logs from Git')
        .option('--dry-run', 'perform a dry run without saving files', DEFAULT_DRY_RUN)
        .option('--verbose', 'enable debug logging', DEFAULT_VERBOSE)
        .option('--openai-api-key', 'OpenAI API key', process.env.OPENAI_API_KEY)
        .option('--diff', 'include the diff in the summary', DEFAULT_DIFF)
        .option('--log', 'include the log in the summary', DEFAULT_LOG)
        .version(VERSION);

    program.parse();

    const options: Input = program.opts<Input>();

    validateOptions(options);

    // Create the run configuration
    const runConfig: Run.Config = Run.createConfig({
        dryRun: options.dryRun,
        verbose: options.verbose,
        diff: options.diff,
        log: options.log,
    });

    return [runConfig];
}

function validateOptions(options: Input) {
    if (!options.openaiApiKey) {
        throw new Error('OpenAI API key is required, set OPENAI_API_KEY environment variable');
    }

    if ((options.diff === false) && (options.log === false)) {
        throw new Error('Either --diff or --log must be provided');
    }
}