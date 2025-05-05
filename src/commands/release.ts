#!/usr/bin/env node
import { Content, createSection, Model, Section, Request } from '@tobrien/minorprompt';
import 'dotenv/config';
import { Config } from '../types';
import { ChatCompletionMessageParam } from 'openai/resources';
import * as Log from '../content/log';
import * as Prompts from '../prompt/prompts';
import { createCompletion } from '../util/openai';
import { DEFAULT_FROM_COMMIT_ALIAS, DEFAULT_TO_COMMIT_ALIAS } from '../constants';

export const execute = async (runConfig: Config) => {
    const prompts = await Prompts.create(runConfig.model as Model, runConfig);

    const contentSections: Section<Content> = createSection<Content>('release');

    const log = await Log.create({ from: runConfig.release?.from ?? DEFAULT_FROM_COMMIT_ALIAS, to: runConfig.release?.to ?? DEFAULT_TO_COMMIT_ALIAS });
    let logContent = '';

    logContent = await log.get();

    if (logContent) {
        const logSection = createSection<Content>('log');
        logSection.add(logContent);
        contentSections.add(logSection);
    }

    const prompt = await prompts.createReleasePrompt(contentSections);

    const request: Request = prompts.format(prompt);

    const summary = await createCompletion(request.messages as ChatCompletionMessageParam[], { model: runConfig.model });

    return summary;
}
