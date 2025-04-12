import { Command, program } from "commander";
import path from "path";
import { Input } from "./arguments.d";
import { ALLOWED_COMMANDS, ALLOWED_CONTENT_TYPES, DEFAULT_CHARACTER_ENCODING, DEFAULT_COMMAND, DEFAULT_CONFIG_DIR, DEFAULT_CONTENT_TYPES, DEFAULT_CONTEXT_DIRECTORIES, DEFAULT_DEBUG, DEFAULT_DRY_RUN, DEFAULT_INSTRUCTIONS_DIR, DEFAULT_MODEL, DEFAULT_OVERRIDES, DEFAULT_SENDIT_MODE, DEFAULT_VERBOSE, PROGRAM_NAME, VERSION } from "./constants";
import { getLogger } from "./logging";
import * as Run from "./run";
import * as Storage from "./util/storage";
import { stringifyJSON } from "./util/general";

export const configure = async (): Promise<[Run.Config]> => {
    const program = new Command();

    // Configure shared options
    program
        .name(PROGRAM_NAME)
        .summary('Create Intelligent Release Notes or Change Logs from Git')
        .description('Create Intelligent Release Notes or Change Logs from Git')
        .version(VERSION);

    const addSharedOptions = (program: Command) => {
        program
            .option('--dry-run', 'perform a dry run without saving files', DEFAULT_DRY_RUN)
            .option('--verbose', 'enable verbose logging', DEFAULT_VERBOSE)
            .option('--debug', 'enable debug logging', DEFAULT_DEBUG)
            .option('--overrides', 'enable overrides', DEFAULT_OVERRIDES)
            .option('--openai-api-key <key>', 'OpenAI API key', process.env.OPENAI_API_KEY)
            .option('--model <model>', 'OpenAI model to use', DEFAULT_MODEL)
            .option('-c, --content-types [contentTypes...]', 'content types to include in the summary', DEFAULT_CONTENT_TYPES)
            .option('-d, --context-directories [contextDirectories...]', 'directories to scan for context', DEFAULT_CONTEXT_DIRECTORIES)
            .option('-i, --instructions <file>', 'instructions for the AI', DEFAULT_INSTRUCTIONS_DIR)
            .option('--config-dir <configDir>', 'configuration directory', DEFAULT_CONFIG_DIR);
    }

    // Add subcommands
    const commitCommand = program
        .command('commit')
        .option('--cached', 'use cached diff')
        .option('--sendit', 'Commit with the message generated. No review. You only live once, so send it.', DEFAULT_SENDIT_MODE)
        .description('Generate commit notes');
    addSharedOptions(commitCommand);

    const releaseCommand = program
        .command('release')
        .description('Generate release notes');
    addSharedOptions(releaseCommand);

    program.parse();

    // Determine which command is being run
    let commandName = DEFAULT_COMMAND;
    let options = {};

    if (program.args.length > 0) {
        commandName = program.args[0];
        if (commandName === 'commit' && commitCommand.opts) {
            options = commitCommand.opts();
        } else if (commandName === 'release' && releaseCommand.opts) {
            options = releaseCommand.opts();
        }
    }

    // If no command-specific options found, use global options
    if (Object.keys(options).length === 0) {
        options = program.opts();
    }

    const params = await validateOptions({
        ...options as Omit<Input, 'commandName'>,
        commandName
    });

    // Create the run configuration
    const runConfig: Run.Config = Run.createConfig(params);

    return [runConfig];
}

async function validateOptions(options: Input): Promise<{
    dryRun: boolean;
    verbose: boolean;
    debug: boolean;
    overrides: boolean;
    contentTypes: string[];
    model: string;
    instructions: string;
    contextDirectories: string[];
    commandName: string;
    configDir: string;
    cached?: boolean;
    sendit: boolean;
}> {
    if (!options.openaiApiKey) {
        throw new Error('OpenAI API key is required, set OPENAI_API_KEY environment variable');
    }

    const contentTypes = options.contentTypes ? validateContentTypes(options.contentTypes) : DEFAULT_CONTENT_TYPES;
    const contextDirectories = await validateContextDirectories(options.contextDirectories || DEFAULT_CONTEXT_DIRECTORIES);
    const instructions: string | null = options.instructions ? await validateInstructions(options.instructions) : null;
    const commandName = validateCommand(options.commandName);
    const configDir = await validateConfigDir(options.configDir || DEFAULT_CONFIG_DIR);

    return {
        dryRun: options.dryRun ?? DEFAULT_DRY_RUN,
        verbose: options.verbose ?? DEFAULT_VERBOSE,
        debug: options.debug ?? DEFAULT_DEBUG,
        overrides: options.overrides ?? DEFAULT_OVERRIDES,
        contentTypes: contentTypes ?? DEFAULT_CONTENT_TYPES,
        model: options.model ?? DEFAULT_MODEL,
        instructions: instructions ?? DEFAULT_INSTRUCTIONS_DIR,
        contextDirectories,
        commandName,
        configDir,
        cached: options.cached,
        sendit: options.sendit ?? DEFAULT_SENDIT_MODE,
    };
}

function validateCommand(commandName: string): string {
    if (!ALLOWED_COMMANDS.includes(commandName)) {
        throw new Error(`Invalid command: ${commandName}, allowed commands: ${ALLOWED_COMMANDS.join(', ')}`);
    }
    return commandName;
}

function validateContentTypes(contentTypes: string[]) {
    if (contentTypes.some(contentType => !ALLOWED_CONTENT_TYPES.includes(contentType))) {
        throw new Error(`Invalid content type: ${contentTypes.join(', ')}, allowed content types: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
    }
    return contentTypes;
}

async function validateConfigDir(configDir: string): Promise<string> {
    const logger = getLogger();
    const storage = Storage.create({ log: logger.info });

    // Make sure the config directory is absolute
    const absoluteConfigDir = path.isAbsolute(configDir) ?
        configDir :
        path.resolve(process.cwd(), configDir);

    // Create the config directory if it doesn't exist
    try {
        if (!(await storage.exists(absoluteConfigDir))) {
            logger.info(`Creating config directory: ${absoluteConfigDir}`);
            await storage.createDirectory(absoluteConfigDir);
        } else if (!(await storage.isDirectory(absoluteConfigDir))) {
            throw new Error(`Config directory is not a directory: ${absoluteConfigDir}`);
        } else if (!(await storage.isDirectoryWritable(absoluteConfigDir))) {
            throw new Error(`Config directory is not writable: ${absoluteConfigDir}`);
        }
    } catch (error: any) {
        logger.error(`Failed to validate or create config directory: ${absoluteConfigDir}`, error);
        throw new Error(`Failed to validate or create config directory: ${absoluteConfigDir}: ${error.message}`);
    }

    return absoluteConfigDir;
}

async function validateContextDirectories(contextDirectories: string[]): Promise<string[]> {
    const logger = getLogger();
    const storage = Storage.create({ log: logger.info });

    // Filter out directories that don't exist
    const validDirectories = [];

    for (const dir of contextDirectories) {
        try {
            if (await storage.isDirectoryReadable(dir)) {
                validDirectories.push(dir);
            } else {
                logger.warn(`Directory not readable: ${dir}`);
            }
        } catch (error: any) {
            logger.warn(`Error validating directory ${dir}: ${error.message}`);
        }
    }

    return validDirectories;
}

async function validateInstructions(instructions: string): Promise<string | null> {
    const logger = getLogger();
    const storage = Storage.create({ log: logger.info });
    try {
        if (await storage.isFileReadable(instructions)) {
            return storage.readFile(instructions, DEFAULT_CHARACTER_ENCODING);
        }
    } catch (error: any) {
        logger.error('Error reading instructions file: %s', error.message);
    }
    return null;
}