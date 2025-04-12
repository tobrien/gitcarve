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

describe('release instructions', () => {
    let ReleaseInstructions: any;
    let Storage: any;

    beforeEach(async () => {
        // Import modules after mocking
        Storage = await import('../../../src/util/storage');
        ReleaseInstructions = await import('../../../src/prompt/instructions/release');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create release instructions with default content when no override', async () => {
        const storage = Storage.create();
        storage.exists.mockResolvedValue(false);

        const result = await ReleaseInstructions.create('/test/config', {
            // @ts-ignore
            customizeContent: jest.fn().mockResolvedValue('default content')
        });

        expect(result).toHaveLength(1);
        expect((result[0] as Instruction).text).toBe('default content');
    });

    it('should create release instructions with override content when available', async () => {
        const storage = Storage.create();
        storage.exists.mockResolvedValue(true);
        storage.readFile.mockResolvedValue('custom instructions');

        const result = await ReleaseInstructions.create('/test/config', {
            // @ts-ignore
            customizeContent: jest.fn().mockResolvedValue('custom instructions')
        });

        expect(result).toHaveLength(1);
        expect((result[0] as Instruction).text).toBe('custom instructions');
    });

    it('should include context sections when context directories provided', async () => {
        const storage = Storage.create();
        storage.exists.mockResolvedValue(false);

        const result = await ReleaseInstructions.create('/test/config', {
            // @ts-ignore
            customizeContent: jest.fn().mockResolvedValue('default content')
        }, ['/test/context']);

        expect(result.length).toBeGreaterThan(0);
        expect((result[0] as Instruction).text).toBe('default content');
    });

    it('should not include context sections when no context directories provided', async () => {
        const storage = Storage.create();
        storage.exists.mockResolvedValue(false);

        const result = await ReleaseInstructions.create('/test/config', {
            // @ts-ignore
            customizeContent: jest.fn().mockResolvedValue('default content')
        });

        expect(result).toHaveLength(1);
        expect((result[0] as Instruction).text).toBe('default content');
    });
});
