// Minimal dependency-free logger used by middleware and services.

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const activeLevel = () => {
    const configured = (process.env.LOG_LEVEL || '').toLowerCase();
    if (configured in LEVELS) return LEVELS[configured];
    return process.env.NODE_ENV === 'production' ? LEVELS.info : LEVELS.debug;
};

const stringify = (value) => {
    if (value instanceof Error) return value.stack || value.message;
    if (value && typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }
    return String(value);
};

const write = (level, args) => {
    if (LEVELS[level] > activeLevel()) return;
    const line = `${new Date().toISOString()} ${level.toUpperCase()} ${args.map(stringify).join(' ')}`;
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
};

const logger = {
    error: (...args) => write('error', args),
    warn: (...args) => write('warn', args),
    info: (...args) => write('info', args),
    debug: (...args) => write('debug', args),
};

export { logger };
export default logger;
