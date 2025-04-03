#!/usr/bin/env node
import { Logger } from 'winston';
import * as Run from './run';
import { run } from './util/child';
import { createCompletion } from './util/openai';
export class ExitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ExitError';
    }
}

export async function gatherChange(runConfig: Run.Config, logger: Logger): Promise<string> {
    try {
        logger.info('Gathering change information from Git');

        try {
            const { stdout, stderr } = await run('git log');
            if (stderr) {
                logger.warn('Git log produced stderr: %s', stderr);
            }
            logger.debug('Git log output: %s', stdout);
            return stdout;
        } catch (error: any) {
            logger.error('Failed to execute git log: %s', error.message);
            throw error;
        }
    } catch (error: any) {
        logger.error('Error occurred during gather change phase: %s %s', error.message, error.stack);
        throw new ExitError('Error occurred during gather change phase');
    }
}

export async function gatherDiff(runConfig: Run.Config, logger: Logger): Promise<string> {
    try {
        logger.info('Gathering change information from Git');

        try {
            const { stdout, stderr } = await run('git diff -- . \': (exclude)dist\' \': (exclude)node_modules\' \': (exclude).env\'');
            if (stderr) {
                logger.warn('Git log produced stderr: %s', stderr);
            }
            logger.debug('Git log output: %s', stdout);
            return stdout;
        } catch (error: any) {
            logger.error('Failed to execute git log: %s', error.message);
            throw error;
        }
    } catch (error: any) {
        logger.error('Error occurred during gather change phase: %s %s', error.message, error.stack);
        throw new ExitError('Error occurred during gather change phase');
    }
}

export async function gatherContext(runConfig: Run.Config, logger: Logger): Promise<string> {
    try {
        logger.info('Gathering context information from Git');

        return `Summarize this git log to create something that understands what has been changed here.
Format the output as markdown.
The content will contain the output of git log and git diff.
Summarize the log messages, but also try to dive into the details of the diff to uncover other changes that might not be properly logged.`;
    } catch (error: any) {
        logger.error('Error occurred during gather context phase: %s %s', error.message, error.stack);
        throw new ExitError('Error occurred during gather context phase');
    }
}

export async function createSummary(change: string, context: string, diff: string, runConfig: Run.Config, logger: Logger): Promise<string> {
    try {
        logger.info('Creating summary');

        const prompt = `
        <context>
        ${context}
        </context>
        <change>
        ${change}
        </change>
        <diff>
        ${diff}
        </diff>
        `

        const summary = await createCompletion(prompt, logger);
        return summary;
    } catch (error: any) {
        logger.error('Error occurred during create summary phase: %s %s', error.message, error.stack);
        throw new ExitError('Error occurred during create summary phase');
    }
}

// export async function configure(options: ArgumentsInput, logger: Logger): Promise<{ runConfig: Run.Config; }> {
//     let runConfig: Run.Config;
//     try {
//         [runConfig] = await Arguments.generateConfig(options);
//         logger.info('\n\n\tRun Configuration: %s', JSON.stringify(runConfig, null, 2).replace(/\n/g, '\n\t') + '\n\n');
//     } catch (error: any) {
//         if (error instanceof ArgumentError) {
//             const argumentError = error as ArgumentError;
//             logger.error('There was an error with a command line argument');
//             logger.error('\tcommand line argument: %s', argumentError.argument);
//             logger.error('\tmessage: %s', argumentError.message);
//         } else {
//             logger.error('A general error occurred during configuration phase: %s %s', error.message, error.stack);
//         }
//         throw new ExitError('Error occurred during configuration phase');
//     }
//     return { runConfig };
// }
