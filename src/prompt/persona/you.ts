import { createPersona, Persona } from "@tobrien/minorprompt";
import { getLogger } from "../../logging";
import { DEFAULT_PERSONA_YOU_INSTRUCTIONS_FILE, DEFAULT_PERSONA_YOU_TRAITS_FILE } from "../../constants";

const PERSONA_YOU_TRAITS: string = `
You are a developer who is contributing to a project that is using Git for source control.

You are an expert at writing documentation for projects, and you are an expert developer who is familiar with the codebase and all of the languages and frameworks used in the project. 
`;

const PERSONA_YOU_INSTRUCTIONS: string = `
You are being asked to write documents that capture the details of changes that have been made to a git project.
`;

export const create = async (configDir: string, { customizeContent }: { customizeContent: (configDir: string, overrideFile: string, content: string) => Promise<string> }): Promise<Persona> => {
    const logger = getLogger();
    const finalTraits = await customizeContent(configDir, DEFAULT_PERSONA_YOU_TRAITS_FILE, PERSONA_YOU_TRAITS);
    const finalInstructions = await customizeContent(configDir, DEFAULT_PERSONA_YOU_INSTRUCTIONS_FILE, PERSONA_YOU_INSTRUCTIONS);

    logger.debug('Final You traits: %s', finalTraits);
    logger.debug('Final You instructions: %s', finalInstructions);

    const persona = createPersona("you");
    persona.addTrait(finalTraits);
    persona.addInstruction(finalInstructions);
    return persona;
}


