
jest.unstable_mockModule('../src/arguments', () => ({
    __esModule: true,
    generateConfig: jest.fn(),
    ArgumentError: jest.fn(),
}));

let Arguments: any;
let Phases: any;

import { jest } from '@jest/globals';
import { Command } from 'commander';
import { ArgumentError } from 'error/ArgumentError';
import { Logger } from 'winston';
// Mock all external dependencies
jest.mock('commander');
jest.mock('../src/run');

describe('Phases Module', () => {
    let mockLogger: jest.Mocked<Logger>;
    let mockProgram: jest.Mocked<Command>;

    beforeEach(async () => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        Arguments = await import('../src/arguments');
        Phases = await import('../src/phases');

        // Setup mock logger
        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
        } as any;

        // Setup mock program
        mockProgram = {
            parse: jest.fn(),
            opts: jest.fn(),
        } as any;
    });

    describe('configure', () => {
        it('should successfully generate configurations', async () => {
            const mockOptions = { verbose: true, credentialsFile: 'value', tokenFile: 'value' };
            const mockRunConfig = { someConfig: 'value' };
            const mockExportConfig = { exportConfig: 'value' };

            // @ts-ignore
            (Arguments.generateConfig as jest.Mock).mockResolvedValue([mockRunConfig, mockExportConfig]);

            // @ts-ignore
            const result = await Phases.configure(mockOptions, mockLogger);

            expect(result).toEqual({
                runConfig: mockRunConfig,
            });
            expect(Arguments.generateConfig).toHaveBeenCalledWith(mockOptions);
        });

        it('should handle ArgumentError by throwing ExitError', async () => {
            const mockOptions = { verbose: true };
            const mockError = new ArgumentError('test', 'test message');

            // @ts-ignore
            (Arguments.generateConfig as jest.Mock).mockRejectedValue(mockError);

            // @ts-ignore
            await expect(Phases.configure(mockOptions, mockLogger)).rejects.toThrow(Phases.ExitError);
            expect(mockLogger.error).toHaveBeenCalledWith('There was an error with a command line argument');
        });
    });

});
