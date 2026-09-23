import log from "electron-log/main";

log.initialize();
log.transports.file.level = "info";
log.transports.console.level = "info";
// Keep logs bounded so they never grow unbounded on a long-running install.
log.transports.file.maxSize = 5 * 1024 * 1024;

/**
 * Redact anything that looks like a token/secret before it ever reaches a
 * log line. Defense in depth on top of "never pass tokens to logger.log()
 * directly" discipline elsewhere in the codebase.
 */
function redact(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/([?&]token=)[^&\s]+/gi, "$1[REDACTED]")
      .replace(/(Bearer\s+)[A-Za-z0-9-_.]+/gi, "$1[REDACTED]");
  }
  return value;
}

export const logger = {
  info: (...args: unknown[]) => log.info(...args.map(redact)),
  warn: (...args: unknown[]) => log.warn(...args.map(redact)),
  error: (...args: unknown[]) => log.error(...args.map(redact)),
};

export default logger;
