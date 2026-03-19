export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string,
    public errors?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/* ---------- 400 ---------- */

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code = "BAD_REQUEST") {
    super(message, 400, code);
  }
}

/* ---------- 404 ---------- */

export class NotFoundError extends AppError {
  constructor(resource = "Resource", code = "NOT_FOUND") {
    super(`${resource} không tồn tại`, 404, code);
  }
}

/* ---------- 409 ---------- */

export class ConflictError extends AppError {
  constructor(message = "Conflict", code = "CONFLICT") {
    super(message, 409, code);
  }
}

export class DuplicateError extends AppError {
  constructor(field = "Field", code = "DUPLICATE") {
    super(`${field} đã được sử dụng`, 409, code);
  }
}

/* ---------- 401 ---------- */

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}

/* ---------- 403 ---------- */

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(message, 403, code);
  }
}
