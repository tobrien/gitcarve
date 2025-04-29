#!/usr/bin/env node
import { Content, createSection, Section } from '@tobrien/minorprompt';
import * as Chat from '@tobrien/minorprompt/chat';
import 'dotenv/config';
import { Config } from '../types';
import { ChatCompletionMessageParam } from 'openai/resources';
import shellescape from 'shell-escape';
import * as Diff from '../content/diff';
import { getLogger } from '../logging';
import * as Prompts from '../prompt/prompts';
import { run } from '../util/child';
import { createCompletion } from '../util/openai';

export const execute = async (runConfig: Config) => {
    const logger = getLogger();
    const prompts = Prompts.create(runConfig.model as Chat.Model, runConfig);

    const contentSections: Section<Content>[] = [];

    let diffContent = '';

    let cached = runConfig.commit?.cached;
    // If cached is undefined? We're going to look for a staged commit; otherwise, we'll use the supplied setting.
    if (runConfig.commit?.cached === undefined) {
        cached = await Diff.hasStagedChanges();
    }
    const options = { cached };
    const diff = await Diff.create(options);
    diffContent = await diff.get();

    const diffSection = createSection<Content>('diff');
    diffSection.add(diffContent);
    contentSections.push(diffSection);


    const prompt = await prompts.createCommitPrompt(contentSections);

    const request: Chat.Request = prompts.format(prompt);

    const summary = await createCompletion(request.messages as ChatCompletionMessageParam[], { model: runConfig.model });

    if (runConfig.commit?.sendit) {
        if (!cached) {
            logger.error('SendIt mode enabled, but no changes to commit. Message: \n\n%s\n\n', summary);
            process.exit(1);
        }

        logger.info('SendIt mode enabled. Committing with message: \n\n%s\n\n', summary);
        try {
            const escapedSummary = shellescape([summary]);
            await run(`git commit -m ${escapedSummary}`);
            logger.info('Commit successful!');
        } catch (error) {
            logger.error('Failed to commit:', error);
            process.exit(1);
        }
    }

    return summary;
}
