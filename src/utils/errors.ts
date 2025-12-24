export class DuplicateError extends Error {
  statusCode = 409;

  constructor(field: string) {
    super(`${field} đã được sử dụng`);
    this.name = "DuplicateError";
  }
}

export class NotFoundError extends Error {
  statusCode = 404;

  constructor(resource: string) {
    super(`Không tìm thấy ${resource}`);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}
