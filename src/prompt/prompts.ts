import * as MinorPrompt from '@tobrien/minorprompt';
import * as Chat from '@tobrien/minorprompt/chat';
import * as Formatter from '@tobrien/minorprompt/formatter';
import { Config as RunConfig } from '../run';
import * as CommitInstructions from './instructions/commit';
import * as ReleaseInstructions from './instructions/release';
import * as YouPersona from './persona/you';
import path from 'path';
import { getLogger } from '../logging';
import * as Storage from '../util/storage';
import * as Context from './context';
import { Content } from '@tobrien/minorprompt';
import { Section } from '@tobrien/minorprompt';

export interface Factory {
    createCommitPrompt: (content: Section<Content>[]) => Promise<MinorPrompt.Instance>;
    createReleasePrompt: (content: Section<Content>[]) => Promise<MinorPrompt.Instance>;
    generateOverrideContent: (configDir: string, overrideFile: string) => Promise<{ override?: string, prepend?: string, append?: string }>;
    customizeContent: (configDir: string, overrideFile: string, content: string) => Promise<string>;
    format: (prompt: MinorPrompt.Instance) => Chat.Request;
}

export const create = (model: Chat.Model, runConfig: RunConfig): Factory => {

    const generateOverrideContent = async (configDir: string, overrideFile: string): Promise<{ override?: string, prepend?: string, append?: string }> => {
        const logger = getLogger();
        const storage = Storage.create({ log: logger.debug });

        const baseFile = path.join(configDir, overrideFile);
        const preFile = baseFile.replace('.md', '-pre.md');
        const postFile = baseFile.replace('.md', '-post.md');

        logger.debug('Files: baseFile %s, preFile %s, postFile %s', baseFile, preFile, postFile);

        const response: { override?: string, prepend?: string, append?: string } = {};

        // Check for underscore file names and throw an error if found
        const underscorePreFile = baseFile.replace('.md', '_pre.md');
        const underscorePostFile = baseFile.replace('.md', '_post.md');

        if (await storage.exists(underscorePreFile) || await storage.exists(underscorePostFile)) {
            logger.error('ERROR: Found files with underscore instead of hyphen. Please use hyphens (-) instead of underscores (_) in file names.');
            throw new Error('Invalid file naming convention. Use hyphens (-) instead of underscores (_) in file names.');
        }


        if (await storage.exists(preFile)) {
            logger.debug('Found pre file %s', preFile);
            const customTraits = await storage.readFile(preFile, 'utf8');
            response.prepend = customTraits;
        }

        if (await storage.exists(postFile)) {
            logger.debug('Found post file %s', postFile);
            const customTraits = await storage.readFile(postFile, 'utf8');
            response.append = customTraits;
        }

        if (await storage.exists(baseFile)) {
            logger.debug('Found base file %s', baseFile);
            if (runConfig.overrides) {
                logger.warn('WARNING: Core directives are being overwritten by custom configuration');
                const customTraits = await storage.readFile(baseFile, 'utf8');
                response.override = customTraits;
            } else {
                logger.error('ERROR: Core directives are being overwritten by custom configuration');
                throw new Error('Core directives are being overwritten by custom configuration, but overrides are not enabled.  Please enable --overrides to use this feature.');
            }
        }

        return response;
    }

    const createCommitPrompt = async (content: Section<Content>[]): Promise<MinorPrompt.Instance> => {
        const prompt: MinorPrompt.Instance = MinorPrompt.create();
        // TODO: Passing this function?  It's hateful.  Let's fix this.
        prompt.addPersona(await YouPersona.create(runConfig.configDir, { customizeContent }));
        const instructions = await CommitInstructions.create(runConfig.configDir, { generateOverrideContent });
        instructions.forEach((instruction) => {
            prompt.addInstruction(instruction);
        });
        content.forEach((section) => {
            prompt.addContent(section);
        });

        const contextSections = await Context.loadContextFromDirectories(runConfig.contextDirectories);
        contextSections.forEach((section) => {
            prompt.addContext(section);
        });

        return prompt;
    };

    const createReleasePrompt = async (content: Section<Content>[]): Promise<MinorPrompt.Instance> => {
        const prompt: MinorPrompt.Instance = MinorPrompt.create();
        prompt.addPersona(await YouPersona.create(runConfig.configDir, { customizeContent }));
        const instructions = await ReleaseInstructions.create(runConfig.configDir, { customizeContent });
        instructions.forEach((instruction) => {
            prompt.addInstruction(instruction);
        });
        content.forEach((section) => {
            prompt.addContent(section);
        });

        const contextSections = await Context.loadContextFromDirectories(runConfig.contextDirectories);
        contextSections.forEach((section) => {
            prompt.addContext(section);
        });

        return prompt;
    }

    const format = (prompt: MinorPrompt.Instance): Chat.Request => {
        const formatter = Formatter.create(model);
        return formatter.format(prompt);
    };



    const customizeContent = async (configDir: string, overrideFile: string, content: string): Promise<string> => {
        const logger = getLogger();
        const { override, prepend, append } = await generateOverrideContent(configDir, overrideFile);
        logger.debug("Content Customization for %s: override: %s, prepend: %s, append: %s", overrideFile, override, prepend, append);
        let finalTraits = content;

        if (override) {
            if (runConfig.overrides) {
                logger.warn('Override found, replacing content from file %s', override);
                finalTraits = override;
            } else {
                logger.error('ERROR: Core directives are being overwritten by custom configuration');
                throw new Error('Core directives are being overwritten by custom configuration, but overrides are not enabled.  Please enable --overrides to use this feature.');
            }
        }

        if (prepend) {
            logger.debug('Prepend found, adding to content from file %s', prepend);
            finalTraits = prepend + '\n' + finalTraits;
        }

        if (append) {
            logger.debug('Append found, adding to content from file %s', append);
            finalTraits = finalTraits + '\n' + append;
        }

        return finalTraits;
    }

    return {
        createCommitPrompt,
        createReleasePrompt,
        generateOverrideContent,
        customizeContent,
        format,
    };
}

