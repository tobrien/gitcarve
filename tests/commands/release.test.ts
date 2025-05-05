import { jest } from '@jest/globals';

// Mock ESM modules
jest.unstable_mockModule('@tobrien/minorprompt', () => ({
    // @ts-ignore
    createSection: jest.fn().mockReturnValue({
        add: jest.fn()
    }),
    Model: {
        GPT_4: 'gpt-4'
    }
}));

jest.unstable_mockModule('../../src/prompt/prompts', () => ({
    // @ts-ignore
    create: jest.fn().mockReturnValue({
        // @ts-ignores
        createReleasePrompt: jest.fn().mockResolvedValue({}),
        format: jest.fn().mockReturnValue({ messages: [] })
    })
}));

jest.unstable_mockModule('../../src/content/log', () => ({
    // @ts-ignore
    create: jest.fn().mockReturnValue({
        // @ts-ignore
        get: jest.fn().mockResolvedValue('mock log content')
    })
}));

jest.unstable_mockModule('../../src/util/openai', () => ({
    // @ts-ignore
    createCompletion: jest.fn().mockResolvedValue('mock summary')
}));

describe('release command', () => {
    let Release: any;
    let MinorPrompt: any;
    let Prompts: any;
    let Log: any;
    let OpenAI: any;

    beforeEach(async () => {
        // Import modules after mocking
        MinorPrompt = await import('@tobrien/minorprompt');
        Prompts = await import('../../src/prompt/prompts');
        Log = await import('../../src/content/log');
        OpenAI = await import('../../src/util/openai');
        Release = await import('../../src/commands/release');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should execute release command with default parameters', async () => {
        const runConfig = {
            model: 'gpt-4'
        };

        const result = await Release.execute(runConfig);

        expect(Log.create).toHaveBeenCalledWith({
            from: 'main',
            to: 'HEAD'
        });
        expect(Prompts.create).toHaveBeenCalledWith('gpt-4', runConfig);
        expect(MinorPrompt.createSection).toHaveBeenCalledWith('release');
        expect(OpenAI.createCompletion).toHaveBeenCalled();
        expect(result).toBe('mock summary');
    });

    it('should execute release command with custom parameters', async () => {
        const runConfig = {
            model: 'gpt-4',
            release: {
                from: 'v1.0.0',
                to: 'main'
            }
        };

        const result = await Release.execute(runConfig);

        expect(Log.create).toHaveBeenCalledWith({
            from: 'v1.0.0',
            to: 'main'
        });
        expect(Prompts.create).toHaveBeenCalledWith('gpt-4', runConfig);
        expect(result).toBe('mock summary');
    });

    it('should not add log section when log content is empty', async () => {
        const runConfig = {
            model: 'gpt-4'
        };

        // Mock empty log content
        Log.create().get.mockResolvedValueOnce('');

        const result = await Release.execute(runConfig);

        // The section.add should not be called with log section
        const sectionAddCalls = MinorPrompt.createSection().add.mock.calls;
        expect(sectionAddCalls.length).toBe(0);
        expect(result).toBe('mock summary');
    });
});
