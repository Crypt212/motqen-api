import { z } from '../libs/zod.js';
import { ResponseConfig } from '@asteasolutions/zod-to-openapi';

type HTTPCode = 200 | '201' | '400' | '401' | '403' | '404' | '422' | '429' | '500';
export type ResponsesDocObject = { [P in HTTPCode]?: ResponseConfig };

export const imageFileZodSchema = (description: string) => {
  z.any().openapi({
    type: 'string',
    format: 'binary',
    description,
  });
};

export function createResponseDoc(params: {
  successfulResponse?: ResponseConfig | true;
  createdSuccessfullyResponse?: ResponseConfig | true;
  badRequestResponse?: ResponseConfig | true;
  unauthorizedResponse?: ResponseConfig | true;
  forbiddenResponse?: ResponseConfig | true;
  notFoundResponse?: ResponseConfig | true;
  validationErrorResponse?: ResponseConfig | true;
  tooManyRequestsResponse?: ResponseConfig | true;
  internalServerError?: ResponseConfig | true;
}): ResponsesDocObject {
  const doc: ResponsesDocObject = {};
  if (params.successfulResponse) {
    doc[200] =
      params.successfulResponse === true
        ? { description: 'Successful Response' }
        : params.successfulResponse;
  }
  if (params.createdSuccessfullyResponse) {
    doc[201] =
      params.createdSuccessfullyResponse === true
        ? { description: 'Created Successfully' }
        : params.createdSuccessfullyResponse;
  }
  if (params.badRequestResponse) {
    doc[400] =
      params.badRequestResponse === true
        ? { description: 'Bad Request' }
        : params.badRequestResponse;
  }
  if (params.unauthorizedResponse) {
    doc[401] =
      params.unauthorizedResponse === true
        ? { description: 'Unauthorized' }
        : params.unauthorizedResponse;
  }
  if (params.forbiddenResponse) {
    doc[403] =
      params.forbiddenResponse === true ? { description: 'Forbidden' } : params.forbiddenResponse;
  }
  if (params.notFoundResponse) {
    doc[404] =
      params.notFoundResponse === true ? { description: 'Not Found' } : params.notFoundResponse;
  }
  if (params.validationErrorResponse) {
    doc[422] =
      params.validationErrorResponse === true
        ? { description: 'Validation Error' }
        : params.validationErrorResponse;
  }
  if (params.tooManyRequestsResponse) {
    doc[429] =
      params.tooManyRequestsResponse === true
        ? { description: 'Too Many Requests' }
        : params.tooManyRequestsResponse;
  }
  if (params.internalServerError) {
    doc[500] =
      params.internalServerError === true
        ? { description: 'Internal Server Error' }
        : params.internalServerError;
  }

  return doc;
}
