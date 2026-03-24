import OperationalError from "./OperationalError.js";
import { z } from '../libs/zod.js';
import { $ZodIssue } from "zod/v4/core";

export default class ValidationError extends OperationalError {
  public issues: $ZodIssue[];

  constructor(message: string, error: z.ZodError) {
    super(message);
    this.issues = error.issues;

    Error.captureStackTrace(this, this.constructor);
  }

  toString() {
    return `${this.message}
==========================================
${this.issues}
==========================================
n${this.stack}
==========================================
`;
  }
}
