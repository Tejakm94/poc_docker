/**
 * Base URL for browser-to-API requests.
 *
 * Set VITE_API_BASE_URL in an environment file or deployment environment to
 * target another API without changing application code.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const DB_RESTORE_API_KEY = import.meta.env.VITE_DB_RESTORE_API_KEY || "1234567890";
