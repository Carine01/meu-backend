import { Logger } from '@nestjs/common';

/**
 * Error Handling Utilities
 * Common error handling patterns used across services
 */

/**
 * Safely extracts error message from unknown error type
 * @param error - Error object (can be Error, string, or unknown)
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

/**
 * Safely extracts error stack from unknown error type
 * @param error - Error object
 * @returns Error stack string or undefined
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Logs error with consistent formatting
 * @param logger - Logger instance
 * @param message - Error message
 * @param error - Error object
 */
export function logError(logger: Logger, message: string, error: unknown): void {
  const errorMessage = getErrorMessage(error);
  const errorStack = getErrorStack(error);
  logger.error(`${message}: ${errorMessage}`, errorStack);
}

/**
 * Wraps async operation with error logging
 * @param logger - Logger instance
 * @param operation - Async operation to execute
 * @param errorMessage - Error message to log on failure
 * @returns Result of operation or undefined on error
 */
export async function tryWithErrorLog<T>(
  logger: Logger,
  operation: () => Promise<T>,
  errorMessage: string,
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    logError(logger, errorMessage, error);
    return undefined;
  }
}
