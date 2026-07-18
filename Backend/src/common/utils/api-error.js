class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    Error.captureStackTrace(this.constructor);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static badRequest(message = "Bad Request") {
    return new ApiError(400, message);
  }

  static conflict(message = "User already Exist") {
    return new ApiError(409, message);
  }

  static badGateway(message = "Bad Gateway") {
    return new ApiError(502, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not Found") {
    return new ApiError(404, message)
  }
}

export default ApiError
