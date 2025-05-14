import { jest } from '@jest/globals';
import { ExitError } from '../../src/error/ExitError';

// Mock ESM modules
jest.unstable_mockModule('../../src/util/child', () => ({
    // @ts-ignore
    run: jest.fn()
}));

jest.unstable_mockModule('../../src/logging', () => ({
    // @ts-ignore
    getLogger: jest.fn().mockReturnValue({
        verbose: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    })
}));

describe('diff', () => {
    let Diff: any;
    let run: any;
    let getLogger: any;

    beforeEach(async () => {
        // Import modules after mocking
        run = await import('../../src/util/child');
        getLogger = await import('../../src/logging');
        Diff = await import('../../src/content/diff');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create diff instance and get content successfully', async () => {
        const mockDiff = 'mock diff content';
        run.run.mockResolvedValue({ stdout: mockDiff, stderr: '' });

        const diff = await Diff.create({ cached: true, excludedPatterns: ['whatever'] });
        const result = await diff.get();

        expect(run.run).toHaveBeenCalledWith('git diff --cached -- . \':(exclude)whatever\'');
        expect(result).toBe(mockDiff);
    });

    it('should handle stderr output', async () => {
        const mockDiff = 'mock diff content';
        const mockStderr = 'warning message';
        run.run.mockResolvedValue({ stdout: mockDiff, stderr: mockStderr });

        const diff = await Diff.create({ cached: true, excludedPatterns: ['whatever'] });
        const result = await diff.get();

        expect(run.run).toHaveBeenCalledWith('git diff --cached -- . \':(exclude)whatever\'');
        expect(result).toBe(mockDiff);
        expect(getLogger.getLogger().warn).toHaveBeenCalledWith('Git log produced stderr: %s', mockStderr);
    });

    it('should handle git diff execution error', async () => {
        const mockError = new Error('git diff failed');
        run.run.mockRejectedValue(mockError);

        const diff = await Diff.create({ cached: false, excludedPatterns: ['whatever'] });

        await expect(diff.get()).rejects.toThrow(ExitError);
        expect(getLogger.getLogger().error).toHaveBeenCalledWith('Failed to execute git log: %s', mockError.message);
    });

});
