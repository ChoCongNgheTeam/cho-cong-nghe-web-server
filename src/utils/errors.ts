export class DuplicateError extends Error {
  constructor(field: string) {
    super(`${field} đã được sử dụng`);
    this.name = "DuplicateError";
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`Không tìm thấy ${resource}`);
    this.name = "NotFoundError";
  }
}
