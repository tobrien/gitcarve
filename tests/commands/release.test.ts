import { jest } from '@jest/globals';
import { ChatCompletionMessageParam } from 'openai/resources';

// Mock ESM modules
jest.unstable_mockModule('../../src/content/diff', () => ({
    // @ts-ignore
    create: jest.fn().mockResolvedValue({
        // @ts-ignore
        get: jest.fn().mockResolvedValue('mock diff content')
    })
}));

jest.unstable_mockModule('../../src/content/log', () => ({
    // @ts-ignore
    create: jest.fn().mockResolvedValue({
        // @ts-ignore
        get: jest.fn().mockResolvedValue('mock log content')
    })
}));

jest.unstable_mockModule('../../src/prompt/prompts', () => ({
    // @ts-ignore
    create: jest.fn().mockResolvedValue({
        // @ts-ignore
        createReleasePrompt: jest.fn().mockResolvedValue('mock prompt'),
        // @ts-ignore
        format: jest.fn().mockReturnValue({
            // @ts-ignore
            messages: [] as ChatCompletionMessageParam[]
        })
    })
}));

jest.unstable_mockModule('../../src/util/openai', () => ({
    // @ts-ignore
    createCompletion: jest.fn().mockResolvedValue('mock summary')
}));

describe('release command', () => {
    let Release: any;
    let Diff: any;
    let Log: any;
    let Prompts: any;
    let createCompletion: any;

    beforeEach(async () => {
        // Import modules after mocking
        Diff = await import('../../src/content/diff');
        Log = await import('../../src/content/log');
        Prompts = await import('../../src/prompt/prompts');
        createCompletion = await import('../../src/util/openai');
        Release = await import('../../src/commands/release');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should run release command with diff content', async () => {
        const runConfig = {
            model: 'gpt-4',
            contentTypes: ['diff']
        };

        const result = await Release.run(runConfig);

        expect(Diff.create).toHaveBeenCalled();
        expect(Log.create).toHaveBeenCalled();
        expect(Prompts.create).toHaveBeenCalledWith(runConfig.model, runConfig);
        expect(createCompletion.createCompletion).toHaveBeenCalled();
        expect(result).toBe('mock summary');
    });

    it('should run release command with log content', async () => {
        const runConfig = {
            model: 'gpt-4',
            contentTypes: ['log']
        };

        const result = await Release.run(runConfig);

        expect(Log.create).toHaveBeenCalled();
        expect(Diff.create).toHaveBeenCalled();
        expect(Prompts.create).toHaveBeenCalledWith(runConfig.model, runConfig);
        expect(createCompletion.createCompletion).toHaveBeenCalled();
        expect(result).toBe('mock summary');
    });

    it('should run release command with both diff and log content', async () => {
        const runConfig = {
            model: 'gpt-4',
            contentTypes: ['diff', 'log']
        };

        const result = await Release.run(runConfig);

        expect(Diff.create).toHaveBeenCalled();
        expect(Log.create).toHaveBeenCalled();
        expect(Prompts.create).toHaveBeenCalledWith(runConfig.model, runConfig);
        expect(createCompletion.createCompletion).toHaveBeenCalled();
        expect(result).toBe('mock summary');
    });

    it('should handle empty content types', async () => {
        const runConfig = {
            model: 'gpt-4',
            contentTypes: []
        };

        const result = await Release.run(runConfig);

        expect(Diff.create).toHaveBeenCalled();
        expect(Log.create).toHaveBeenCalled();
        expect(Prompts.create).toHaveBeenCalledWith(runConfig.model, runConfig);
        expect(createCompletion.createCompletion).toHaveBeenCalled();
        expect(result).toBe('mock summary');
    });
});
