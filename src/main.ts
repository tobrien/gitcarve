#!/usr/bin/env node
import 'dotenv/config';
import * as Arguments from './arguments';
import { getLogger, setLogLevel } from './logging';
import { createSummary, ExitError, gatherChange, gatherContext, gatherDiff } from './phases';
import * as Run from './run';

export async function main() {


    const [runConfig]: [Run.Config] = Arguments.configure();

    // Set log level based on verbose flag
    if (runConfig.verbose) {
        setLogLevel('debug');
    }
    const logger = getLogger();

    try {

        const change = await gatherChange(runConfig, logger);
        const context = await gatherContext(runConfig, logger);
        const diff = await gatherDiff(runConfig, logger);
        const summary = await createSummary(change, context, diff, runConfig, logger);

        // eslint-disable-next-line no-console
        console.log(summary);
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