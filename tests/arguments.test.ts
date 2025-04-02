import { jest } from '@jest/globals';
import { Command } from 'commander';

// Import modules asynchronously using dynamic imports to support ESM
let mockRun: any;
let mockExport: any;
let ArgumentError: any;
let configure: any;
let generateConfig: any;
let Storage: any;

// Mock dependencies
jest.mock('../src/run.js', () => ({
    __esModule: true,
    createConfig: jest.fn(() => ({ verbose: false, dryRun: false }))
}));

// Load all dynamic imports before tests
beforeAll(async () => {
    mockRun = await import('../src/run.js');

    const argumentsModule = await import('../src/arguments.js');
    configure = argumentsModule.configure;
    generateConfig = argumentsModule.generateConfig;
});

describe('arguments', () => {
    let program: Command;

    beforeEach(() => {
        jest.clearAllMocks();
        program = new Command();
        configure(program);
    });

    describe('configure', () => {
        it('should configure program with all options', () => {
            const options = program.opts();
            expect(program.name()).toBe('gitchange');
            expect(program.description()).toBeDefined();
            expect(program.summary).toBeDefined();
        });
    });

});
