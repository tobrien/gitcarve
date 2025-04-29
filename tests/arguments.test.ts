import { jest } from '@jest/globals';
import { DEFAULT_CONFIG_DIR, DEFAULT_CONTEXT_DIRECTORIES, DEFAULT_INSTRUCTIONS_DIR, DEFAULT_MODEL } from '../src/constants.js';

// Mock dependencies
// @ts-ignore
jest.mock('../src/run.js', () => ({
    __esModule: true,
    createConfig: jest.fn(() => ({
        dryRun: false,
        verbose: false,
        debug: false,
        overrides: false,
        instructions: DEFAULT_INSTRUCTIONS_DIR,
        model: DEFAULT_MODEL,
        configDir: DEFAULT_CONFIG_DIR,
        contextDirectories: DEFAULT_CONTEXT_DIRECTORIES,
        commandName: 'commit'
    }))
}));

// Mock the Command class
// @ts-ignore
jest.mock('commander', () => {
    const mockCommand = jest.fn().mockImplementation(() => {
        const cmd = {
            name: jest.fn().mockReturnThis(),
            summary: jest.fn().mockReturnThis(),
            description: jest.fn().mockReturnThis(),
            argument: jest.fn().mockReturnThis(),
            option: jest.fn().mockReturnThis(),
            version: jest.fn().mockReturnThis(),
            command: jest.fn().mockReturnThis(),
            parse: jest.fn(),
            args: ['commit'],
            opts: jest.fn().mockReturnValue({
                dryRun: false,
                verbose: false,
                openaiApiKey: 'test-api-key'
            })
        };
        return cmd;
    });
    return { Command: mockCommand };
});

// Mock ESM modules
// @ts-ignore
jest.unstable_mockModule('../src/util/storage.js', () => ({
    // @ts-ignore
    create: jest.fn().mockReturnValue({
        // @ts-ignore
        exists: jest.fn().mockResolvedValue(true),
        // @ts-ignore
        isDirectory: jest.fn().mockResolvedValue(true),
        // @ts-ignore
        isDirectoryWritable: jest.fn().mockResolvedValue(true),
        // @ts-ignore
        isDirectoryReadable: jest.fn().mockResolvedValue(true),
        // @ts-ignore
        isFileReadable: jest.fn().mockResolvedValue(true),
        // @ts-ignore
        readFile: jest.fn().mockResolvedValue("mock file content"),
        // @ts-ignore
        createDirectory: jest.fn().mockResolvedValue(undefined)
    })
}));

// Import modules asynchronously using dynamic imports to support ESM
let mockRun: any;
let configure: any;
let Storage: any;

// Load all dynamic imports before tests
beforeAll(async () => {
    mockRun = await import('../src/run.js');
    const argumentsModule = await import('../src/arguments.js');
    configure = argumentsModule.configure;
    Storage = await import('../src/util/storage.js');
});

describe('arguments', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        process.env.OPENAI_API_KEY = 'test-api-key';
    });

    afterEach(() => {
        delete process.env.OPENAI_API_KEY;
    });

    describe('configure', () => {
        it('should configure program with default options', async () => {
            const [config] = await configure();
            expect(config).toBeDefined();
            expect(config.dryRun).toBe(false);
            expect(config.verbose).toBe(false);
            expect(config.debug).toBe(false);
            expect(config.overrides).toBe(false);
            expect(config.instructions).toBe(DEFAULT_INSTRUCTIONS_DIR);
            expect(config.model).toBe(DEFAULT_MODEL);
            expect(config.configDir).toContain(DEFAULT_CONFIG_DIR);
            expect(config.contextDirectories).toEqual(DEFAULT_CONTEXT_DIRECTORIES);
        });
    });
});  
