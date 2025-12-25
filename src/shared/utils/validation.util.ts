/**
 * Validation Utilities
 * Common validation functions used across services
 */

/**
 * Validates that clinicId is not empty or null
 * @param clinicId - Clinic ID to validate
 * @throws Error if clinicId is invalid
 */
export function validateClinicId(clinicId: string): void {
  if (!clinicId || clinicId.trim() === '') {
    throw new Error('clinicId é obrigatório');
  }
}

/**
 * Validates required string field
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if value is empty
 */
export function validateRequiredField(value: string, fieldName: string): void {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} é obrigatório`);
  }
}

/**
 * Sanitizes string by trimming whitespace
 * @param value - String to sanitize
 * @returns Trimmed string or empty string if null/undefined
 */
export function sanitizeString(value: string | null | undefined): string {
  return value?.trim() || '';
}

/**
 * Validates phone number format (Brazilian E.164 format)
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  return /^\+55\d{10,11}$/.test(phone);
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
