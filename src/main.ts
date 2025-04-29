#!/usr/bin/env node
import 'dotenv/config';
import * as Arguments from './arguments';
import * as Commit from './commands/commit';
import * as Release from './commands/release';
import { COMMAND_COMMIT, COMMAND_RELEASE } from './constants';
import { getLogger, setLogLevel } from './logging';
import * as Run from './run';

export async function main() {
    const [runConfig]: [Run.Config] = await Arguments.configure();

    // Set log level based on verbose flag
    if (runConfig.verbose) {
        setLogLevel('verbose');
    }
    if (runConfig.debug) {
        setLogLevel('debug');
    }

    const logger = getLogger();

    try {
        // Get the command from Commander
        const command = process.argv[2];
        let commandName = runConfig.commandName;

        // If we have a specific command argument, use that
        if (command === 'commit' || command === 'release') {
            commandName = command;
        }

        let summary: string = '';

        if (commandName === COMMAND_COMMIT) {
            summary = await Commit.execute(runConfig);
        } else if (commandName === COMMAND_RELEASE) {
            summary = await Release.execute(runConfig);
        }

        // eslint-disable-next-line no-console
        console.log(`\n\n${summary}\n\n`);

    } catch (error: any) {
        logger.error('Exiting due to Error: %s, %s', error.message, error.stack);
        process.exit(1);
    }
}

main();