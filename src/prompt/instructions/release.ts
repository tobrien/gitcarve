import { Instruction, Section, createInstruction } from "@tobrien/minorprompt";
import { DEFAULT_INSTRUCTIONS_RELEASE_FILE } from "../../constants";
import * as Context from "../../prompt/context";
import { getLogger } from "../../logging";

const INSTRUCTIONS_PROCESS = `
Task #1: Write release notes by reading all of the log messages from this release and writing a summary of the release.

Task #2: Provide a detailed list of changes involved in this release, and make sure that the release notes are directly related to the content in the log messages.

Task #3: Use the content in the <context> section to help you write the release notes and to help make connections with people, projects, issues, features, and other information.

### Output Restrictions

- Do not mention and people or contributors in the release notes.  For example, do not say, "Thanks to John Doe for this feature."  Release notes are to be impersonal and not focused on indiviudals.

- Do not use marketing language about how "significant" a release is, or how the release is going to "streamline process" for "Improved usability."   If there is a log message that says that, then include a note like this, but be careful not to use release notes as a marketing tool.

- If the release is very simple, keep the release notes short and simple.   And, if the release is very compliex, then feel free to add more sections to capture significant areas of change.

### Output Format

    ## Release: Create a Title for this Release

    (summarize the release in two paragraphs)

    ## New Features

    Identify some of the latest changes that have been made

    ## Other Improvements 

    Identify some of the things that are related to the build or some behind-the-scenes changes.

### Use the Context

Use the context to help you write the release notes and to help make connections with people, projects, issues, features, and other information.
`;

export const create = async (configDir: string,
    { customizeContent }: { customizeContent: (configDir: string, overrideFile: string, content: string) => Promise<string> },
    contextDirectories?: string[]
): Promise<(Instruction | Section<Instruction>)[]> => {
    const logger = getLogger();
    const instructions: (Instruction | Section<Instruction>)[] = [];

    logger.debug('Creating release instructions: configuDir %s, overrideFile %s', configDir, DEFAULT_INSTRUCTIONS_RELEASE_FILE);
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

