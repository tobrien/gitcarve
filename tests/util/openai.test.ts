import { jest } from '@jest/globals';

// Mock ESM modules
jest.unstable_mockModule('../../src/util/storage', () => ({
    // @ts-ignore
    create: jest.fn().mockReturnValue({
        // @ts-ignore
        writeFile: jest.fn().mockResolvedValue(undefined),
        // @ts-ignore
        readStream: jest.fn().mockResolvedValue('mock-audio-stream')
    })
}));

// Define mock functions with any type to avoid TS errors
const mockChatCreate = jest.fn<any>();
const mockTranscriptionsCreate = jest.fn<any>();

jest.unstable_mockModule('openai', () => ({
    OpenAI: jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: mockChatCreate
            }
        },
        audio: {
            transcriptions: {
                create: mockTranscriptionsCreate
            }
        }
    }))
}));

describe('openai', () => {
    let openai: any;
    let Storage: any;
    let createCompletion: any;
    let transcribeAudio: any;

    beforeEach(async () => {
        // Import modules after mocking
        openai = await import('openai');
        Storage = await import('../../src/util/storage');
        const openaiModule = await import('../../src/util/openai');
        createCompletion = openaiModule.createCompletion;
        transcribeAudio = openaiModule.transcribeAudio;

        // Set up environment
        process.env.OPENAI_API_KEY = 'test-api-key';
    });

    afterEach(() => {
        delete process.env.OPENAI_API_KEY;
        jest.clearAllMocks();
    });

    describe('createCompletion', () => {
        it('should create completion successfully', async () => {
            const mockResponse = {
                choices: [{
                    message: {
                        content: 'test response'
                    }
                }]
            };

            mockChatCreate.mockResolvedValue(mockResponse);

            const result = await createCompletion([{ role: 'user', content: 'test' }]);
            expect(result).toBe('test response');
        });

        it('should handle JSON response format', async () => {
            const mockResponse = {
                choices: [{
                    message: {
                        content: '{"key": "value"}'
                    }
                }]
            };

            mockChatCreate.mockResolvedValue(mockResponse);

            const result = await createCompletion([{ role: 'user', content: 'test' }], { responseFormat: { type: 'json_object' } });
            expect(result).toEqual({ key: 'value' });
        });

        it('should write debug file when debug is enabled', async () => {
            const mockResponse = {
                choices: [{
                    message: {
                        content: 'test response'
                    }
                }]
            };

            mockChatCreate.mockResolvedValue(mockResponse);

            await createCompletion([{ role: 'user', content: 'test' }], { debug: true, debugFile: 'debug.json' });
            expect(Storage.create().writeFile).toHaveBeenCalledWith('debug.json', expect.any(String), 'utf8');
        });

    });
});
