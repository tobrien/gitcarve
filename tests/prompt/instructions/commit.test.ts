import { jest } from '@jest/globals';
import { Instruction } from '@tobrien/minorprompt';

// Mock ESM modules
jest.unstable_mockModule('../../../src/util/storage', () => ({
    // @ts-ignore
    create: jest.fn().mockReturnValue({
        exists: jest.fn(),
        readFile: jest.fn()
    })
}));

describe('commit instructions', () => {
    let CommitInstructions: any;
    let Storage: any;

    beforeEach(async () => {
        // Import modules after mocking
        Storage = await import('../../../src/util/storage');
        CommitInstructions = await import('../../../src/prompt/instructions/commit');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create commit instructions with default content when no override', async () => {
        const storage = Storage.create();
        storage.exists.mockResolvedValue(false);

        const result = await CommitInstructions.create('/test/config', {
            // @ts-ignore
            generateOverrideContent: jest.fn().mockResolvedValue({})
        });

        expect(result).toHaveLength(1);
        expect((result[0] as Instruction).text).toContain('Task #1: Create a commit message');
    });

    it('should create commit instructions with override content when available', async () => {
        const storage = Storage.create();
        storage.exists.mockResolvedValue(true);
        storage.readFile.mockResolvedValue('custom instructions');

        const result = await CommitInstructions.create('/test/config', {
            // @ts-ignore
            generateOverrideContent: jest.fn().mockResolvedValue({
                override: 'custom instructions'
            })
        });

        expect(result).toHaveLength(1);
        expect((result[0] as Instruction).text).toBe('custom instructions');
    });

    it('should prepend and append content when available', async () => {
        const storage = Storage.create();
        storage.exists.mockResolvedValue(true);
        storage.readFile.mockResolvedValue('custom content');

        const result = await CommitInstructions.create('/test/config', {
            // @ts-ignore
            generateOverrideContent: jest.fn().mockResolvedValue({
                // @ts-ignore
                prepend: 'prepend content',
                // @ts-ignore
                append: 'append content'
            })
        });

        expect(result).toHaveLength(3);
        expect((result[0] as Instruction).text).toBe('prepend content');
        expect((result[1] as Instruction).text).toContain('Don\'t start the commit message with a sentence that refers to the project.');
        expect((result[2] as Instruction).text).toBe('append content');
    });

    it('should handle all override content types together', async () => {
        const storage = Storage.create();
        storage.exists.mockResolvedValue(true);
        storage.readFile.mockResolvedValue('custom content');

        const result = await CommitInstructions.create('/test/config', {
            // @ts-ignore
            generateOverrideContent: jest.fn().mockResolvedValue({
                override: 'override content',
                prepend: 'prepend content',
                append: 'append content'
            })
        });

        expect(result).toHaveLength(3);
        expect((result[0] as Instruction).text).toBe('prepend content');
        expect((result[1] as Instruction).text).toBe('override content');
        expect((result[2] as Instruction).text).toBe('append content');
    });
});
