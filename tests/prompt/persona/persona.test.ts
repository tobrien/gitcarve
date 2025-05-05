import { jest } from '@jest/globals';
import path from 'path';

// Mock ESM modules
jest.unstable_mockModule('../../../src/logging', () => ({
    // @ts-ignore
    getLogger: jest.fn().mockReturnValue({
        debug: jest.fn(),
        error: jest.fn()
    })
}));

jest.unstable_mockModule('@tobrien/minorprompt', () => ({
    // @ts-ignore
    Parser: {
        parseFile: jest.fn()
    },
    // @ts-ignore
    Formatter: {
        format: jest.fn()
    }
}));

jest.unstable_mockModule('../../../src/prompt/override', () => ({
    // @ts-ignore
    customize: jest.fn()
}));

describe('persona', () => {
    let Persona: any;
    let getLogger: any;
    let Parser: any;
    let Formatter: any;
    let customize: any;

    beforeEach(async () => {
        // Import modules after mocking
        const logging = await import('../../../src/logging');
        getLogger = logging.getLogger;

        const minorprompt = await import('@tobrien/minorprompt');
        Parser = minorprompt.Parser;
        Formatter = minorprompt.Formatter;

        const override = await import('../../../src/prompt/override');
        customize = override.customize;

        Persona = await import('../../../src/prompt/persona/persona');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create persona instructions', async () => {
        const mockInstructions = { title: 'Test Persona', content: [] };
        const mockCustomizedInstructions = { title: 'Customized Persona', content: [] };

        Parser.parseFile.mockResolvedValue(mockInstructions);
        customize.mockResolvedValue(mockCustomizedInstructions);

        const result = await Persona.create('test', '/config', 'override.md', true);

        expect(Parser.parseFile).toHaveBeenCalled();
        expect(customize).toHaveBeenCalledWith('/config', 'override.md', mockInstructions, true);
        expect(getLogger().debug).toHaveBeenCalled();
        expect(result).toBe(mockCustomizedInstructions);
    });

    it('should use correct file path based on persona', async () => {
        const mockInstructions = { title: 'Test Persona', content: [] };

        Parser.parseFile.mockResolvedValue(mockInstructions);
        customize.mockResolvedValue(mockInstructions);

        await Persona.create('custom', '/config', 'override.md', true);

        // Check that the correct file path was used based on persona name
        const expectedPath = expect.stringContaining('custom.md');
        expect(Parser.parseFile).toHaveBeenCalledWith(expectedPath);
    });

    it('should skip customization when overrides is false', async () => {
        const mockInstructions = { title: 'Test Persona', content: [] };

        Parser.parseFile.mockResolvedValue(mockInstructions);
        customize.mockResolvedValue(mockInstructions);

        await Persona.create('test', '/config', 'override.md', false);

        expect(customize).toHaveBeenCalledWith('/config', 'override.md', mockInstructions, false);
    });
});
