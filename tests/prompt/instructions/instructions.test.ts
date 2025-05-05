import { jest } from '@jest/globals';

// Mock ESM modules
jest.unstable_mockModule('@tobrien/minorprompt', () => ({
    // @ts-ignore
    Parser: {
        parseFile: jest.fn()
    },
    Formatter: {
        format: jest.fn().mockReturnValue('formatted instructions')
    }
}));

jest.unstable_mockModule('../../../src/prompt/override', () => ({
    // @ts-ignore
    customize: jest.fn()
}));

jest.unstable_mockModule('../../../src/logging', () => ({
    // @ts-ignore
    getLogger: jest.fn().mockReturnValue({
        debug: jest.fn(),
        error: jest.fn()
    })
}));

describe('instructions', () => {
    let Instructions: any;
    let MinorPrompt: any;
    let Override: any;
    let Logging: any;

    beforeEach(async () => {
        // Import modules after mocking
        MinorPrompt = await import('@tobrien/minorprompt');
        Override = await import('../../../src/prompt/override');
        Logging = await import('../../../src/logging');
        Instructions = await import('../../../src/prompt/instructions/instructions');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create instructions correctly', async () => {
        const mockInstructions = { type: 'section', content: 'test instructions' };
        const mockCustomizedInstructions = { type: 'section', content: 'customized instructions' };

        // @ts-ignore
        MinorPrompt.Parser.parseFile.mockResolvedValue(mockInstructions);
        // @ts-ignore
        Override.customize.mockResolvedValue(mockCustomizedInstructions);

        const result = await Instructions.create('system', '/config', 'override.md', true);

        expect(MinorPrompt.Parser.parseFile).toHaveBeenCalled();
        expect(Override.customize).toHaveBeenCalledWith(
            '/config',
            'override.md',
            mockInstructions,
            true
        );
        expect(Logging.getLogger().debug).toHaveBeenCalled();
        expect(result).toBe(mockCustomizedInstructions);
    });

    it('should handle different instruction types', async () => {
        const mockInstructions = { type: 'section', content: 'test instructions' };

        // @ts-ignore
        MinorPrompt.Parser.parseFile.mockResolvedValue(mockInstructions);
        // @ts-ignore
        Override.customize.mockImplementation((_, __, instructions) => Promise.resolve(instructions));

        await Instructions.create('user', '/config', 'override.md', false);

        // Verify it uses the correct type in the file path
        expect(MinorPrompt.Parser.parseFile).toHaveBeenCalledWith(
            expect.stringContaining('user.md')
        );
    });

    it('should pass the override flag correctly', async () => {
        const mockInstructions = { type: 'section', content: 'test instructions' };

        // @ts-ignore
        MinorPrompt.Parser.parseFile.mockResolvedValue(mockInstructions);
        // @ts-ignore
        Override.customize.mockImplementation((_, __, instructions, overrides) => Promise.resolve({ overrides }));

        const resultWithOverrides = await Instructions.create('system', '/config', 'override.md', true);
        expect(resultWithOverrides.overrides).toBe(true);

        const resultWithoutOverrides = await Instructions.create('system', '/config', 'override.md', false);
        expect(resultWithoutOverrides.overrides).toBe(false);
    });
});
