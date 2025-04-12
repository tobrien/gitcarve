#!/usr/bin/env node
import { Content, createSection, Section } from '@tobrien/minorprompt';
import 'dotenv/config';
import { createCompletion } from '../util/openai';
import * as Diff from '../content/diff';
import * as Log from '../content/log';
import * as Prompts from '../prompt/prompts';
import * as Run from '../run';
import * as Chat from '@tobrien/minorprompt/chat';
import { ChatCompletionMessageParam } from 'openai/resources';

export const execute = async (runConfig: Run.Config) => {
    const prompts = await Prompts.create(runConfig.model as Chat.Model, runConfig);

    const contentSections: Section<Content>[] = [];

    const log = await Log.create();
    const diff = await Diff.create({ cached: runConfig.cached });
    let logContent = '';
    let diffContent = '';

    if (runConfig.contentTypes.includes('log')) {
        logContent = await log.get();
    }

    if (runConfig.contentTypes.includes('diff')) {
        diffContent = await diff.get();
    }


    if (logContent) {
        const logSection = createSection<Content>('log');
        logSection.add(logContent);
        contentSections.push(logSection);
    }

    if (diffContent) {
        const diffSection = createSection<Content>('diff');
        diffSection.add(diffContent);
        contentSections.push(diffSection);
    }

    const prompt = await prompts.createReleasePrompt(contentSections);

    const request: Chat.Request = prompts.format(prompt);

    const summary = await createCompletion(request.messages as ChatCompletionMessageParam[], { model: runConfig.model });

    return summary;
}
