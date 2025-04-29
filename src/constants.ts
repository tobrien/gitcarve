export const VERSION = '__VERSION__ (__GIT_BRANCH__/__GIT_COMMIT__ __GIT_TAGS__ __GIT_COMMIT_DATE__) __SYSTEM_INFO__';
export const PROGRAM_NAME = 'gitcarve';
export const DEFAULT_CHARACTER_ENCODING = 'utf-8';
export const DEFAULT_BINARY_TO_TEXT_ENCODING = 'base64';
export const DEFAULT_DIFF = true;
export const DEFAULT_LOG = false;
export const DEFAULT_OVERRIDES = false;
export const DATE_FORMAT_MONTH_DAY = 'MM-DD';
export const DATE_FORMAT_YEAR = 'YYYY';
export const DATE_FORMAT_YEAR_MONTH = 'YYYY-MM';
export const DATE_FORMAT_YEAR_MONTH_DAY = 'YYYY-MM-DD';
export const DATE_FORMAT_YEAR_MONTH_DAY_SLASH = 'YYYY/MM/DD';
export const DATE_FORMAT_YEAR_MONTH_DAY_HOURS_MINUTES = 'YYYY-MM-DD-HHmm';
export const DATE_FORMAT_YEAR_MONTH_DAY_HOURS_MINUTES_SECONDS = 'YYYY-MM-DD-HHmmss';
export const DATE_FORMAT_YEAR_MONTH_DAY_HOURS_MINUTES_SECONDS_MILLISECONDS = 'YYYY-MM-DD-HHmmss.SSS';
export const DATE_FORMAT_MONTH = 'MM';
export const DATE_FORMAT_DAY = 'DD';
export const DATE_FORMAT_HOURS = 'HHmm';
export const DATE_FORMAT_MINUTES = 'mm';
export const DATE_FORMAT_SECONDS = 'ss';
export const DATE_FORMAT_MILLISECONDS = 'SSS';
export const DEFAULT_VERBOSE = false;
export const DEFAULT_DRY_RUN = false;
export const DEFAULT_DEBUG = false;
export const DEFAULT_MODEL = 'gpt-4o-mini';
export const DEFAULT_CONTEXT_DIRECTORIES: string[] = [];

export const COMMAND_COMMIT = 'commit';
export const COMMAND_RELEASE = 'release';
export const ALLOWED_COMMANDS = [COMMAND_COMMIT, COMMAND_RELEASE];
export const DEFAULT_COMMAND = COMMAND_COMMIT;

export const DEFAULT_CONFIG_DIR = `.${PROGRAM_NAME}`;

export const DEFAULT_PERSONAS_DIR = `/personas`;

export const DEFAULT_PERSONA_YOU_TRAITS_FILE = `${DEFAULT_PERSONAS_DIR}/you/traits.md`;
export const DEFAULT_PERSONA_YOU_INSTRUCTIONS_FILE = `${DEFAULT_PERSONAS_DIR}/you/instructions.md`;

export const DEFAULT_INSTRUCTIONS_DIR = `/instructions`;

export const DEFAULT_INSTRUCTIONS_COMMIT_FILE = `${DEFAULT_INSTRUCTIONS_DIR}/commit.md`;
export const DEFAULT_INSTRUCTIONS_RELEASE_FILE = `${DEFAULT_INSTRUCTIONS_DIR}/release.md`;

export const DEFAULT_CACHED = false;

export const DEFAULT_SENDIT_MODE = false;

export const DEFAULT_FROM_COMMIT_ALIAS = 'main';
export const DEFAULT_TO_COMMIT_ALIAS = 'HEAD';
export const DEFAULT_VERSION = '1.0.0';