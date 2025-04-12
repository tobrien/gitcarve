import { Instruction, Section, createInstruction } from "@tobrien/minorprompt";
import { DEFAULT_INSTRUCTIONS_RELEASE_FILE } from "../../constants";
import * as Context from "../../prompt/context";

const INSTRUCTIONS_PROCESS = `
You are an expert developer that is making a release of a project.

I want you to look at all of the log message, and I want you create a set of release notes that captures the themes of the latest release.

## Release Notes

(summarize the release in two paragraphs)

## New Features

Identify some of the latest changes that have been made

## Other Improvements 

Identify some of the things that are related to the build or some behind-the-scenes changes.
`;

export const create = async (configDir: string,
    { customizeContent }: { customizeContent: (configDir: string, overrideFile: string, content: string) => Promise<string> },
    contextDirectories?: string[]
): Promise<(Instruction | Section<Instruction>)[]> => {
    const instructions: (Instruction | Section<Instruction>)[] = [];

    const overrideContent = await customizeContent(configDir, DEFAULT_INSTRUCTIONS_RELEASE_FILE, INSTRUCTIONS_PROCESS);

    const instruction = createInstruction(overrideContent);
    instructions.push(instruction);

    // Load context from directories using the shared utility
    if (contextDirectories && contextDirectories.length > 0) {
        const contextSections = await Context.loadContextFromDirectories(contextDirectories);
        instructions.push(...contextSections);
    }

    return instructions;
}

