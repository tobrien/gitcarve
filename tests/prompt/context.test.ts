import { jest } from '@jest/globals';

// Mock ESM modules
jest.unstable_mockModule('../../src/util/storage', () => ({
    // @ts-ignore
    create: jest.fn().mockReturnValue({
        exists: jest.fn(),
        readFile: jest.fn(),
        listFiles: jest.fn(),
        isFile: jest.fn()
    })
}));

jest.unstable_mockModule('../../src/logging', () => ({
    // @ts-ignore
    getLogger: jest.fn().mockReturnValue({
        debug: jest.fn(),
        error: jest.fn()
    })
}));

describe('context', () => {
    let Context: any;
    let Storage: any;
    let getLogger: any;

    beforeEach(async () => {
        // Import modules after mocking
        Storage = await import('../../src/util/storage');
        getLogger = await import('../../src/logging');
        Context = await import('../../src/prompt/context');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should extract first header from markdown', () => {
        const markdown = '# Test Header\nSome content';
        const result = Context.extractFirstHeader(markdown);
        expect(result).toBe('Test Header');
    });

    it('should return null when no header found', () => {
        const markdown = 'No header here';
        const result = Context.extractFirstHeader(markdown);
        expect(result).toBeNull();
    });

    it('should remove first header from markdown', () => {
        const markdown = '# Test Header\nSome content';
        const result = Context.removeFirstHeader(markdown);
        expect(result).toBe('Some content');
    });

    it('should return original text when no header found', () => {
        const markdown = 'No header here';
        const result = Context.removeFirstHeader(markdown);
        expect(result).toBe(markdown);
    });

    it('should load context from directories with context.md', async () => {
        const mockContextDirs = ['/test/context'];
        const mockContextContent = '# Main Context\nContext content';
        const mockFileContent = '# File Section\nFile content';

        const storage = Storage.create();
        storage.exists.mockResolvedValue(true);
        storage.readFile.mockResolvedValueOnce(mockContextContent);
        storage.listFiles.mockResolvedValue(['file.md']);
        storage.isFile.mockResolvedValue(true);
        storage.readFile.mockResolvedValueOnce(mockFileContent);

        const result = await Context.loadContextFromDirectories(mockContextDirs);

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Main Context');
    });

    it('should load context from directories without context.md', async () => {
        const mockContextDirs = ['/test/context'];
        const mockFileContent = '# File Section\nFile content';

        const storage = Storage.create();
        storage.exists.mockResolvedValue(false);
        storage.listFiles.mockResolvedValue(['file.md']);
        storage.isFile.mockResolvedValue(true);
        storage.readFile.mockResolvedValue(mockFileContent);

        const result = await Context.loadContextFromDirectories(mockContextDirs);

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('context');
    });

    it('should handle errors when processing context directories', async () => {
        const mockContextDirs = ['/test/context'];
        const mockError = new Error('Storage error');

        const storage = Storage.create();
        storage.exists.mockRejectedValue(mockError);

        const result = await Context.loadContextFromDirectories(mockContextDirs);

        expect(result).toHaveLength(0);
        expect(getLogger.getLogger().error).toHaveBeenCalledWith(
            'Error processing context directory /test/context: Error: Storage error'
        );
    });

    it('should return empty array when no directories provided', async () => {
        const result = await Context.loadContextFromDirectories();
        expect(result).toHaveLength(0);
    });
});
