# Git Intelligent Change

Git Intelligent Change is a powerful utility designed to automatically generate intelligent change logs and insights from your Git repository. It analyzes commit history, pull requests, and related metadata to create comprehensive, well-structured documentation of your project's evolution. By leveraging advanced parsing and analysis techniques, it helps teams maintain clear visibility into their codebase's development history while reducing the manual effort typically required for changelog maintenance.

## Installation

Install Git Intelligent Change globally using npm:

```bash
npm install -g @tobrien/gitcarve
```

This will make the `gitcarve` command available globally on your system.

## Commands

Git Intelligent Change provides two main commands:

### Commit Command

Generate intelligent commit messages:

```bash
gitcarve commit
```

> [!TIP]
> ### Working with Staged Changes
> 
> When you have staged changes using `git add`, the `gitcarve commit` command will automatically analyze the diff of your staged changes. This allows you to selectively stage files and generate a commit message that specifically addresses those changes, rather than all uncommitted changes in your working directory.

> [!TIP]
> ### Quick Commit with --sendit
> 
> If you trust the quality of the generated commit messages, you can use the `--sendit` flag to automatically commit your changes with the generated message without review. This is useful for quick, routine changes where you want to streamline your workflow.


### Release Command

Generate comprehensive release notes based on changes since the last release:

```bash
gitcarve release
```

> [!TIP]
> ### Custom Release Range
> 
> The `gitcarve release` command supports customizing the range of commits to analyze using the `--from` and `--to` options. By default, it compares changes between the `main` branch and `HEAD`, but you can specify any valid Git reference (branch, tag, or commit hash) for either endpoint. This flexibility allows you to generate release notes for specific version ranges or between different branches.

> [!TIP]
> ### Comparing Releases
> 
> You can use the `--from` and `--to` options to generate release notes comparing two different releases. For example, to see what changed between v1.0.0 and v1.1.0, you could use `gitcarve release --from v1.0.0 --to v1.1.0`. This is particularly useful for creating detailed changelogs when preparing release documentation.


## Command Line Options

Git Intelligent Change provides several command line options to customize its behavior:

### Basic Options

- `--dry-run`: Perform a dry run without saving files (default: false)
- `--verbose`: Enable verbose logging (default: false)
- `--debug`: Enable debug logging (default: false)
- `--version`: Display version information

### Commit Command Options

- `--cached`: Use cached diff for generating commit messages
- `--sendit`: Commit with the generated message without review (default: false)

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

- `-i, --instructions <file>`: Path to custom instructions file for the AI (default: './.gitcarve/instructions.md')

### Examples

Basic usage with default settings:
```bash
gitcarve commit
```

Generate a commit message and automatically commit it:
```bash
gitcarve commit --sendit
```

Generate release notes:
```bash
gitcarve release
```

Generate a summary including both git log and diff information:
```bash
gitcarve release --content-types log diff
```

Run in verbose mode with a custom OpenAI model:
```bash
gitcarve commit --verbose --model gpt-4
```

Use custom instructions from a file:
```bash
gitcarve release --instructions ./my-custom-instructions.md
```

### Configuration Directory

Git Intelligent Change uses a configuration directory to store custom settings, instructions, and other configuration files. You can specify a custom location using the `--config-dir` option:

```bash
gitcarve --config-dir ~/custom-gitcarve-config
```

By default, the configuration directory is set to `.gitcarve` in your current working directory. This directory is created automatically if it doesn't exist.

The configuration directory structure is as follows:

```
.gitcarve/
├── instructions/
│   ├── commit.md         # Override for commit instructions
│   ├── commit-pre.md     # Content prepended to default commit instructions
│   ├── commit-post.md    # Content appended to default commit instructions
│   ├── release.md        # Override for release instructions
│   ├── release-pre.md    # Content prepended to default release instructions
│   └── release-post.md   # Content appended to default release instructions
└── ...                   # Other configuration files
```

## Default Instructions

Git Intelligent Change comes with default instructions that guide the AI in generating release notes or change logs. These instructions are defined in the source code:

- **Commit Instructions**: The default instructions for commit message generation are defined in [src/prompt/instructions/commit.ts](https://github.com/tobrien/gitcarve/blob/main/src/prompt/instructions/commit.ts).

- **Release Instructions**: The default instructions for release notes generation are defined in [src/prompt/instructions/release.ts](https://github.com/tobrien/gitcarve/blob/main/src/prompt/instructions/release.ts).

These instruction files contain detailed guidelines for the AI on how to format and structure the output, including examples and specific requirements for different types of changes.

### Customizing Instructions

You can override these default instructions in several ways:

1. **Command Line Option**: Use the `--instructions` flag to specify a custom instructions file:
   ```bash
   gitcarve --instructions ./my-custom-instructions.txt
   ```

2. **Default Location**: Even without specifying a command line option, Git Intelligent Change will automatically look for an instructions file at `./.gitcarve/instructions.md` in your current working directory.

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

## Context

Git Intelligent Change can use contextual information about your project to generate more meaningful commit messages and release notes. Context is provided through Markdown files stored in a dedicated directory.

### Context Directory Structure

The structure of your context directory is entirely up to you. There are no strict requirements for how you organize your context files - you can structure them in whatever way makes the most sense for your project and team.

Here are two example approaches to organizing context files:

#### Hierarchical Structure Example

You can organize context in a hierarchical structure with subdirectories for different categories:

```
.gitcarve/context/
├── context.md                # Main context file describing sections
├── people/                   # Directory for information about people
│   ├── context.md            # Description of the people section
│   ├── team-members.md       # Information about team members
│   └── contributors.md       # Information about contributors
├── projects/                 # Directory for project information
│   ├── context.md            # Description of the projects section
│   └── project-details.md    # Details about various projects
└── technologies/             # Directory for technical information
    ├── context.md            # Description of the technologies section
    ├── frameworks.md         # Information about frameworks used
    └── libraries.md          # Information about libraries used
```

#### Individual Records Example

Alternatively, you can use a flatter structure with individual files for each entity:

```
.gitcarve/context/
├── context.md                # Main context file describing sections
├── people/                   # Directory for individual people information
│   ├── context.md            # Description of the people section
│   ├── john-doe.md           # Information specific to John Doe
│   ├── jane-smith.md         # Information specific to Jane Smith
│   └── alex-johnson.md       # Information specific to Alex Johnson
```

Choose the organization that works best for your needs. The system will process the context files regardless of the structure, as long as they follow the basic Markdown formatting guidelines.

### Main Context File

The `context.md` file in each directory serves as an introduction to that section. The system loads this file first to understand the structure of the information. For example, a `context.md` file in the people directory might look like:

```markdown
## People

This section contains subsections that have information about people.
```

### Context Files

After loading the `context.md` file, the system reads all other Markdown files in the directory. It uses the first header in each file as the name of the section or subsection. For example:

```markdown
## Team Members

- John Doe: Lead Developer, focuses on backend systems
- Jane Smith: UX Designer, specializes in responsive interfaces
- Alex Johnson: DevOps Engineer, manages deployment pipelines
```

### Context Location

You can specify where to store your context files in two recommended ways:

1. **Project Directory**: Store context files in your project repository at `.gitcarve/context/`. This is useful when the context is specific to the project and should be versioned with the code.

2. **gitignore Directory**: Alternatively, you can store context in your `.gitignore` directory if you want to keep it separate from your project files or if the context contains sensitive information that shouldn't be committed to the repository.

To specify a custom context directory, use the `--context-dir` option:

```bash
gitcarve commit --context-dir ~/my-custom-context
```

By default, Git Intelligent Change looks for context in the `.gitcarve/context` directory within your project.

## Configuration Directory

The configuration directory (configDir) allows you to further customize both commit and release instructions by adding pre and post content to the default instructions. This is done by creating additional files in your `.gitcarve/instructions` directory:

### Release Instructions
1. **Pre-Content**: Create a file named `release-pre.md` to add content that will be prepended to the default release instructions.
2. **Post-Content**: Create a file named `release-post.md` to add content that should be appended to the default release instructions.

### Commit Instructions
1. **Pre-Content**: Create a file named `commit-pre.md` to add content that will be prepended to the default commit instructions.
2. **Post-Content**: Create a file named `commit-post.md` to add content that should be appended to the default commit instructions.

For example, if you want to add specific formatting requirements before the default release instructions, you could create `.gitcarve/instructions/release-pre.md`, and if you want to add instructions to the end of the commit instrucitons, you would have a file in `.gitcarve/instructions/commit-post.md`.

### Overriding Default Instructions

While the pre and post content files provide a way to extend the default instructions, you can also completely replace them by creating either `commit.md` or `release.md` in your `.gitcarve/instructions` directory. This gives you full control over the instruction content.

However, please note that completely replacing the default instructions should be done with caution. The default instructions are carefully crafted to:
- Ensure consistent formatting
- Maintain proper context awareness
- Follow best practices for commit messages and release notes
- Handle edge cases and special scenarios

By replacing these instructions entirely, you may lose these benefits and potentially create inconsistencies in your documentation. It's recommended to use the pre and post content files to extend the default instructions rather than replacing them entirely, unless you have a specific need to do so.

To enable instruction overrides, you'll need to use the `--overrides` flag when running the command.











