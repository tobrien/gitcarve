import { jest } from '@jest/globals';
import { ChatCompletionMessageParam } from 'openai/resources';

// Mock ESM modules
jest.unstable_mockModule('../../src/content/diff', () => ({
    // @ts-ignore
    create: jest.fn().mockResolvedValue({
        // @ts-ignore
        get: jest.fn().mockResolvedValue('mock diff content')
    }),
    // @ts-ignore
    hasStagedChanges: jest.fn().mockResolvedValue(true)
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
        createCommitPrompt: jest.fn().mockResolvedValue('mock prompt'),
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

describe('commit command', () => {
    let Commit: any;
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
        Commit = await import('../../src/commands/commit');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should run commit command with diff content', async () => {
        const runConfig = {
            model: 'gpt-4',
            contentTypes: ['diff']
        };

        const result = await Commit.run(runConfig);

        expect(Diff.create).toHaveBeenCalled();
        expect(Log.create).not.toHaveBeenCalled();
        expect(Prompts.create).toHaveBeenCalledWith(runConfig.model, runConfig);
        expect(createCompletion.createCompletion).toHaveBeenCalled();
        expect(result).toBe('mock summary');
    });

    it('should run commit command with both diff and log content', async () => {
        const runConfig = {
            model: 'gpt-4',
            contentTypes: ['diff', 'log']
        };

        const result = await Commit.run(runConfig);

        expect(Diff.create).toHaveBeenCalled();
        expect(Prompts.create).toHaveBeenCalledWith(runConfig.model, runConfig);
        expect(createCompletion.createCompletion).toHaveBeenCalled();
        expect(result).toBe('mock summary');
    });

    it('should handle empty content types', async () => {
        const runConfig = {
            model: 'gpt-4',
            contentTypes: []
        };

        const result = await Commit.run(runConfig);

        expect(Diff.create).not.toHaveBeenCalled();
        expect(Log.create).not.toHaveBeenCalled();
        expect(Prompts.create).toHaveBeenCalledWith(runConfig.model, runConfig);
        expect(createCompletion.createCompletion).toHaveBeenCalled();
        expect(result).toBe('mock summary');
    });
});
