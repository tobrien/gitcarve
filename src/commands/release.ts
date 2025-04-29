#!/usr/bin/env node
import { Content, createSection, Section } from '@tobrien/minorprompt';
import 'dotenv/config';
import { createCompletion } from '../util/openai';
import * as Log from '../content/log';
import * as Prompts from '../prompt/prompts';
import * as Run from '../run';
import * as Chat from '@tobrien/minorprompt/chat';
import { ChatCompletionMessageParam } from 'openai/resources';

export const execute = async (runConfig: Run.Config) => {
    const prompts = await Prompts.create(runConfig.model as Chat.Model, runConfig);

    const contentSections: Section<Content>[] = [];

    const log = await Log.create({ fromCommitAlias: runConfig.fromCommitAlias, toCommitAlias: runConfig.toCommitAlias });
    let logContent = '';

    logContent = await log.get();

    if (logContent) {
        const logSection = createSection<Content>('log');
        logSection.add(logContent);
        contentSections.push(logSection);
    }

    const prompt = await prompts.createReleasePrompt(contentSections);

    const request: Chat.Request = prompts.format(prompt);

    const summary = await createCompletion(request.messages as ChatCompletionMessageParam[], { model: runConfig.model });

    return summary;
}
