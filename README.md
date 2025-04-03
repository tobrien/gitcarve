# Git Intelligent Change

Git Intelligent Change is a powerful utility designed to automatically generate intelligent change logs and insights from your Git repository. It analyzes commit history, pull requests, and related metadata to create comprehensive, well-structured documentation of your project's evolution. By leveraging advanced parsing and analysis techniques, it helps teams maintain clear visibility into their codebase's development history while reducing the manual effort typically required for changelog maintenance.

## Installation

Install Git Intelligent Change globally using npm:

```bash
npm install -g @tobrien/gitchange
```

This will make the `gitchange` command available globally on your system.

## Command Line Options

Git Intelligent Change provides several command line options to customize its behavior:

### Basic Options

- `--dry-run`: Perform a dry run without saving files (default: false)
- `--verbose`: Enable verbose logging (default: false)
- `--debug`: Enable debug logging (default: false)
- `--version`: Display version information

### OpenAI Configuration

- `--openai-api-key <key>`: OpenAI API key (can also be set via OPENAI_API_KEY environment variable)
- `--model <model>`: OpenAI model to use (default: 'gpt-4o-mini')

> [!NOTE]
> ### Security Considerations
> 
> The OpenAI API key should be handled securely. While the `--openai-api-key` option is available, it's recommended to use environment variables instead. Git Intelligent Change automatically loads environment variables from a `.env` file in your current working directory.
> 
> While environment variables are a common approach for configuration, they can still pose security risks if not properly managed. We strongly encourage users to utilize secure credential management solutions like 1Password, HashiCorp Vault, or other keystores to protect sensitive information. This helps prevent accidental exposure of API keys and other credentials in logs, process listings, or environment dumps.

### Content Configuration

- `-c, --content-types [types...]`: Content types to include in the summary (default: ['diff'])
  - Available types: 'log', 'diff'
  - Can specify multiple types: `--content-types log diff`

### Instructions

- `-i, --instructions <file>`: Path to custom instructions file for the AI (default: './.gitchange/instructions.md')

### Examples

Basic usage with default settings:
```bash
gitchange
```

Generate a summary including both git log and diff information:
```bash
gitchange --content-types log diff
```

Run in verbose mode with a custom OpenAI model:
```bash
gitchange --verbose --model gpt-4
```

Use custom instructions from a file:
```bash
gitchange --instructions ./my-custom-instructions.md
```

## Default Instructions

Git Intelligent Change comes with default instructions that guide the AI in generating release notes or change logs. These instructions are:

```
You are a helpful assistant that can write a release note or change log from a git commit message.

The release note or change log should be written in markdown format.

The release note or change log should be written in the following format:

# Release Note or Change Log

## Summary

## Details

## Notes
```

### Customizing Instructions

You can override these default instructions in several ways:

1. **Command Line Option**: Use the `--instructions` flag to specify a custom instructions file:
   ```bash
   gitchange --instructions ./my-custom-instructions.txt
   ```

2. **Default Location**: Even without specifying a command line option, Git Intelligent Change will automatically look for an instructions file at `./.gitchange/instructions.md` in your current working directory.

3. **File Format**: While the default file is named `instructions.md`, you can use any text file with any extension. The content doesn't have to be in Markdown format - any plain text content will work. This gives you flexibility to use your preferred text editor or format for writing instructions.

## Prompt Structure

When Git Intelligent Change sends a request to the LLM, it structures the prompt using XML-like tags to organize different components of the input. The prompt is composed of three main sections:

```
<instructions>
[Your custom instructions or the default instructions]
</instructions>

<log>
[Git log output if --content-types includes 'log']
</log>

<diff>
[Git diff output if --content-types includes 'diff']
</diff>
```

Each section serves a specific purpose:
- `<instructions>`: Contains the guidance for the LLM on how to format and structure the output
- `<log>`: Contains the git log output, providing commit history and messages
- `<diff>`: Contains the git diff output, showing the actual code changes

The sections that are included depend on your `--content-types` configuration. For example, if you only specify `--content-types diff`, the `<log>` section will be empty. This modular structure allows the LLM to process different types of git information while maintaining clear separation between instructions and content.

