import { OpenAPIRegistry, OpenApiGeneratorV3 }
  from '@asteasolutions/zod-to-openapi';

// Part of the example
// import { LoginSchema } from '../schemas/auth.schema';

export const registry = new OpenAPIRegistry();

// EXAMPLE HERE NIGGAS
//
// registry.registerPath({
//   method: 'post',
//   path: '/auth/login',
//   summary: 'Login with OTP',
//   request: {
//     body: {
//       content: { 'application/json': { schema: LoginSchema } }
//     }
//   },
//   responses: {
//     200: { description: 'Auth token returned' },
//     400: { description: 'Validation error' },
//     404: { description: 'User not found' },
//   },
// });

export function generateOpenAPISpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: { title: 'API', version: '1.0.0' },
  });
}
