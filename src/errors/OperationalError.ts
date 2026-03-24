export default class OperationalError extends Error{

  constructor(message: string) {
    super(message);

    Error.captureStackTrace(this, this.constructor);
  }
}
