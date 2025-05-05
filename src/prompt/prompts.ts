import { Content, Context, createPrompt, createSection, Formatter, Model, Prompt, Request, Section } from '@tobrien/minorprompt';
import { DEFAULT_INSTRUCTIONS_COMMIT_FILE, DEFAULT_INSTRUCTIONS_RELEASE_FILE, DEFAULT_PERSONA_YOU_FILE } from '../constants';
import { Config as RunConfig } from '../types';
import * as ContextLoader from './context';
import * as Instructions from './instructions/instructions';
import * as Persona from './persona/persona';

export interface Factory {
    createCommitPrompt: (content: Section<Content>) => Promise<Prompt>;
    createReleasePrompt: (content: Section<Content>) => Promise<Prompt>;
    format: (prompt: Prompt) => Request;
}

export const create = (model: Model, runConfig: RunConfig): Factory => {

    const createCommitPrompt = async (content: Section<Content>): Promise<Prompt> => {
        // TODO: Passing this function?  It's hateful.  Let's fix this.
        const persona = await Persona.create("you", runConfig.configDirectory, DEFAULT_PERSONA_YOU_FILE, runConfig.overrides || false);
        const instructions = await Instructions.create("commit", runConfig.configDirectory, DEFAULT_INSTRUCTIONS_COMMIT_FILE, runConfig.overrides || false);

        const context = createSection<Context>("Context");
        const contextSections = await ContextLoader.loadContextFromDirectories(runConfig.contextDirectories);
        contextSections.forEach((section) => {
            context.add(section);
        });

        const prompt = createPrompt(persona, instructions, content, context);
        return prompt;
    };

    const createReleasePrompt = async (content: Section<Content>): Promise<Prompt> => {
        // TODO: Passing this function?  It's hateful.  Let's fix this.
        const persona = await Persona.create("you", runConfig.configDirectory, DEFAULT_PERSONA_YOU_FILE, runConfig.overrides || false);
        const instructions = await Instructions.create("commit", runConfig.configDirectory, DEFAULT_INSTRUCTIONS_RELEASE_FILE, runConfig.overrides || false);

        const context = createSection<Context>("Context");
        const contextSections = await ContextLoader.loadContextFromDirectories(runConfig.contextDirectories);
        contextSections.forEach((section) => {
            context.add(section);
        });

        const prompt = createPrompt(persona, instructions, content, context);
        return prompt;
    }

    const format = (prompt: Prompt): Request => {
        return Formatter.formatPrompt(model, prompt);
    };


    return {
        createCommitPrompt,
        createReleasePrompt,
        format,
    };
}

