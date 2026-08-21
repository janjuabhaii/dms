/**
 * Standardized success response envelope.
 *
 * Every successful API response follows the same shape so the frontend
 * Axios layer / React Query hooks can rely on a single contract:
 *
 *   { success: true, statusCode, message, data }
 *
 * Usage in a controller:
 *   res.status(200).json(new ApiResponse(200, products, "Products fetched"));
 */
class ApiResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

export { ApiResponse };
