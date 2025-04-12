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

describe('log', () => {
    let Log: any;
    let run: any;
    let getLogger: any;

    beforeEach(async () => {
        // Import modules after mocking
        run = await import('../../src/util/child');
        getLogger = await import('../../src/logging');
        Log = await import('../../src/content/log');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create log instance and get content successfully', async () => {
        const mockLog = 'mock log content';
        run.run.mockResolvedValue({ stdout: mockLog, stderr: '' });

        const log = await Log.create();
        const result = await log.get();

        expect(run.run).toHaveBeenCalledWith('git log');
        expect(result).toBe(mockLog);
    });

    it('should handle stderr output', async () => {
        const mockLog = 'mock log content';
        const mockStderr = 'warning message';
        run.run.mockResolvedValue({ stdout: mockLog, stderr: mockStderr });

        const log = await Log.create();
        const result = await log.get();

        expect(run.run).toHaveBeenCalledWith('git log');
        expect(result).toBe(mockLog);
        expect(getLogger.getLogger().warn).toHaveBeenCalledWith('Git log produced stderr: %s', mockStderr);
    });

    it('should handle git log execution error', async () => {
        const mockError = new Error('git log failed');
        run.run.mockRejectedValue(mockError);

        const log = await Log.create();

        await expect(log.get()).rejects.toThrow(ExitError);
        expect(getLogger.getLogger().error).toHaveBeenCalledWith('Failed to execute git log: %s', mockError.message);
    });

    it('should handle general error during gather change phase', async () => {
        const mockError = new Error('general error');
        run.run.mockRejectedValue(mockError);

        const log = await Log.create();

        await expect(log.get()).rejects.toThrow(ExitError);
        expect(getLogger.getLogger().error).toHaveBeenCalledWith(
            'Error occurred during gather change phase: %s %s',
            mockError.message,
            mockError.stack
        );
    });
});
