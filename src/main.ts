#!/usr/bin/env node
import { Command } from 'commander';
import * as Arguments from './arguments';
import { Input as ArgumentsInput } from './arguments.d';
import { PROGRAM_NAME, VERSION } from './constants';
import { getLogger, setLogLevel } from './logging';
import { configure, ExitError, gatherChange } from './phases';
import * as Run from './run';

export async function main() {

    // eslint-disable-next-line no-console
    console.info(`Starting ${PROGRAM_NAME}: ${VERSION}`);

    const program = new Command();
    Arguments.configure(program);
    program.parse();

    const options: ArgumentsInput = program.opts();

    // Set log level based on verbose flag
    if (options.verbose) {
        setLogLevel('debug');
    }
    const logger = getLogger();

    try {

        const { runConfig }: { runConfig: Run.Config; } = await configure(options, logger);
        await gatherChange(runConfig, logger);

    } catch (error: any) {
        if (error instanceof ExitError) {
            logger.error('Exiting due to Error');
        } else {
            logger.error('Exiting due to Error: %s', error.message);
        }
        process.exit(1);
    }
}

main();