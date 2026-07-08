class ApiErrorResponse {
  constructor(statusCode, message, errors = null) {
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }
}

export default ApiErrorResponse;