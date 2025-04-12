/**
 * Common error handling utilities
 */

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any): {
  status: number;
  message: string;
} {
  console.error("API Error:", error);

  // Default error response
  let status = 500;
  let message = "An unexpected error occurred";

  // Handle network errors
  if (!error.response) {
    return {
      status,
      message: "Network error. Please check your connection.",
    };
  }

  // Handle standard HTTP errors
  if (error.response) {
    status = error.response.status;

    // Handle different types of errors based on status code
    switch (status) {
      case 400:
        message = error.response.data?.error || "Bad request. Please check your input.";
        break;
      case 401:
        message = "Authentication required. Please sign in again.";
        break;
      case 403:
        message = "You don't have permission to perform this action.";
        break;
      case 404:
        message = "The requested resource was not found.";
        break;
      case 422:
        message = "Validation error. Please check your input.";
        break;
      case 429:
        message = "Rate limit exceeded. Please try again later.";
        break;
      default:
        message = error.response.data?.error || "Something went wrong. Please try again.";
    }
  }

  return { status, message };
}

/**
 * Parse Google Sheets API errors
 */
export function handleGoogleSheetsError(error: any): {
  status: number;
  message: string;
} {
  console.error("Google Sheets API Error:", error);

  // Default error response
  let status = 500;
  let message = "Error interacting with your spreadsheet";

  if (!error.response) {
    return {
      status,
      message: "Network error connecting to Google Sheets. Please try again.",
    };
  }

  if (error.response) {
    status = error.response.status;

    // Handle Google Sheets API specific errors
    if (error.response.data?.error) {
      const errorData = error.response.data.error;
      
      // Extract the relevant error information
      if (errorData.message) {
        message = errorData.message;
      }
      
      // Handle specific Google Sheets errors
      if (errorData.status === "PERMISSION_DENIED") {
        message = "You don't have permission to access this spreadsheet. Please check sharing settings.";
      } else if (errorData.status === "NOT_FOUND") {
        message = "Spreadsheet not found. It may have been deleted or you don't have access.";
      } else if (errorData.status === "INVALID_ARGUMENT") {
        message = "Invalid input: " + errorData.message;
      } else if (errorData.status === "RESOURCE_EXHAUSTED") {
        message = "Google API quota exceeded. Please try again later.";
      }
    }
  }

  return { status, message };
}

/**
 * Format validation errors for UI display
 */
export function formatValidationErrors(errors: Record<string, string[]>): string {
  if (!errors || Object.keys(errors).length === 0) {
    return "Validation failed";
  }

  // Create a list of error messages
  const errorMessages: string[] = [];
  
  for (const [field, fieldErrors] of Object.entries(errors)) {
    if (fieldErrors.length > 0) {
      errorMessages.push(`${field}: ${fieldErrors.join(", ")}`);
    }
  }

  return errorMessages.join("; ");
} 