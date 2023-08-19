class CustomApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
class BadRequestError extends CustomApiError {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}
class UnAuthenticatedError extends CustomApiError {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}
class NotFoundError extends CustomApiError {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

module.exports = {
  BadRequestError,
  UnAuthenticatedError,
  CustomApiError,
  NotFoundError,
};
