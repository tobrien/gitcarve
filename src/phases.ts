#!/usr/bin/env node
import { Logger } from 'winston';
import * as Arguments from './arguments';
import { Input as ArgumentsInput } from './arguments.d';
import { ArgumentError } from './error/ArgumentError';
import * as Run from './run';
export class ExitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ExitError';
    }
}

export async function gatherChange(runConfig: Run.Config, logger: Logger) {
    try {
        logger.info('Gathering change information from Git');
    } catch (error: any) {
        logger.error('Error occurred during gather change phase: %s %s', error.message, error.stack);
        throw new ExitError('Error occurred during gather change phase');
    }
}

export async function configure(options: ArgumentsInput, logger: Logger): Promise<{ runConfig: Run.Config; }> {
    let runConfig: Run.Config;
    try {
        [runConfig] = await Arguments.generateConfig(options);
        logger.info('\n\n\tRun Configuration: %s', JSON.stringify(runConfig, null, 2).replace(/\n/g, '\n\t') + '\n\n');
    } catch (error: any) {
        if (error instanceof ArgumentError) {
            const argumentError = error as ArgumentError;
            logger.error('There was an error with a command line argument');
            logger.error('\tcommand line argument: %s', argumentError.argument);
            logger.error('\tmessage: %s', argumentError.message);
        } else {
            logger.error('A general error occurred during configuration phase: %s %s', error.message, error.stack);
        }
        throw new ExitError('Error occurred during configuration phase');
    }
    return { runConfig };
}
