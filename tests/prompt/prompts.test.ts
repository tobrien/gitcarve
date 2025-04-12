import { jest } from '@jest/globals';
import { ChatCompletionMessageParam } from 'openai/resources';
import { Content, Section } from '@tobrien/minorprompt';

// Mock ESM modules
jest.unstable_mockModule('../../src/prompt/context', () => ({
    // @ts-ignore
    loadContextFromDirectories: jest.fn().mockResolvedValue([])
}));

jest.unstable_mockModule('../../src/prompt/persona/you', () => ({
    // @ts-ignore
    create: jest.fn().mockResolvedValue('mock persona')
}));

jest.unstable_mockModule('../../src/prompt/instructions/commit', () => ({
    // @ts-ignore
    create: jest.fn().mockResolvedValue(['mock commit instruction'])
}));

jest.unstable_mockModule('../../src/prompt/instructions/release', () => ({
    // @ts-ignore
    create: jest.fn().mockResolvedValue(['mock release instruction'])
}));

jest.unstable_mockModule('../../src/util/storage', () => ({
    // @ts-ignore
    create: jest.fn().mockReturnValue({
        exists: jest.fn(),
        readFile: jest.fn()
    })
}));

jest.unstable_mockModule('../../src/logging', () => ({
    // @ts-ignore
    getLogger: jest.fn().mockReturnValue({
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    })
}));

describe('prompts', () => {
    let Prompts: any;
    let Context: any;
    let YouPersona: any;
    let CommitInstructions: any;
    let ReleaseInstructions: any;
    let Storage: any;
    let getLogger: any;

    beforeEach(async () => {
        // Import modules after mocking
        Context = await import('../../src/prompt/context');
        YouPersona = await import('../../src/prompt/persona/you');
        CommitInstructions = await import('../../src/prompt/instructions/commit');
        ReleaseInstructions = await import('../../src/prompt/instructions/release');
        Storage = await import('../../src/util/storage');
        getLogger = await import('../../src/logging');
        Prompts = await import('../../src/prompt/prompts');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create commit prompt with content and context', async () => {
        const mockContent: Section<Content>[] = [{
            title: 'Test Section',
            items: [{
                text: 'Test content',
                weight: 1
            }],
            add: jest.fn(),
        }];
        const mockContext = [{
            title: 'Test Context',
            content: 'Context content'
        }];
        Context.loadContextFromDirectories.mockResolvedValue(mockContext);

        const factory = Prompts.create('gpt-4', { configDir: '/test/config' });
        const prompt = await factory.createCommitPrompt(mockContent);

        expect(YouPersona.create).toHaveBeenCalledWith('/test/config', expect.any(Object));
        expect(CommitInstructions.create).toHaveBeenCalledWith('/test/config', expect.any(Object));
        expect(Context.loadContextFromDirectories).toHaveBeenCalled();
    });

    it('should create release prompt with content and context', async () => {
        const mockContent: Section<Content>[] = [{
            title: 'Test Section',
            items: [{
                text: 'Test content',
                weight: 1
            }],
            add: jest.fn(),
        }];
        const mockContext = [{
            title: 'Test Context',
            items: [{
                text: 'Context content',
                weight: 1
            }],
            add: jest.fn(),
        }];
        Context.loadContextFromDirectories.mockResolvedValue(mockContext);

        const factory = Prompts.create('gpt-4', { configDir: '/test/config' });
        const prompt = await factory.createReleasePrompt(mockContent);

        expect(YouPersona.create).toHaveBeenCalledWith('/test/config', expect.any(Object));
        expect(ReleaseInstructions.create).toHaveBeenCalledWith('/test/config', expect.any(Object));
        expect(Context.loadContextFromDirectories).toHaveBeenCalled();
    });

    it('should generate override content with pre and post files', async () => {
        const storage = Storage.create();
        storage.exists.mockImplementation((path: string) => Promise.resolve(!path.includes('_')));
        storage.readFile.mockResolvedValue('custom content');

        const factory = Prompts.create('gpt-4', { configDir: '/test/config', overrides: true });
        const result = await factory.generateOverrideContent('/test/config', 'test.md');

        expect(result).toEqual({
            prepend: 'custom content',
            override: 'custom content',
            append: 'custom content'
        });
    });

    it('should handle override content with overrides enabled', async () => {
        const storage = Storage.create();
        storage.exists.mockImplementation((path: string) => Promise.resolve(!path.includes('_')));
        storage.readFile.mockResolvedValue('custom content');

        const factory = Prompts.create('gpt-4', {
            configDir: '/test/config',
            overrides: true
        });
        const result = await factory.generateOverrideContent('/test/config', 'test.md');

        expect(result).toEqual({
            override: 'custom content',
            prepend: 'custom content',
            append: 'custom content'
        });
    });

    it('should throw error when override content found but overrides disabled', async () => {
        const storage = Storage.create();
        storage.exists.mockImplementation((path: string) => Promise.resolve(!path.includes('_')));
        storage.readFile.mockResolvedValue('custom content');

        const factory = Prompts.create('gpt-4', { configDir: '/test/config' });

        await expect(factory.generateOverrideContent('/test/config', 'test.md'))
            .rejects.toThrow('Core directives are being overwritten by custom configuration');
    });

    it('should customize content with prepend and append', async () => {
        const storage = Storage.create();
        storage.exists.mockImplementation((path: string) => Promise.resolve(!path.includes('_')));
        storage.readFile.mockResolvedValue('custom content');

        const factory = Prompts.create('gpt-4', { configDir: '/test/config', overrides: true });
        const result = await factory.customizeContent('/test/config', 'test.md', 'original content');

        expect(result).toBe('custom content\ncustom content\ncustom content');
    });

    it('should format prompt with model', () => {
        const factory = Prompts.create('gpt-4', { configDir: '/test/config', overrides: true });
        const mockPrompt = {
            personas: [],
            instructions: [],
            contents: [],
            contexts: [],
            addPersona: jest.fn(),
            addInstruction: jest.fn(),
            addContent: jest.fn(),
            addContext: jest.fn(),
            format: jest.fn().mockReturnValue({ messages: [] as ChatCompletionMessageParam[] })
        };

        const result = factory.format(mockPrompt);

        expect(result).toMatchObject({
            model: 'gpt-4',
            messages: expect.arrayContaining([
                expect.objectContaining({
                    role: 'user'
                })
            ])
        });
    });
});
