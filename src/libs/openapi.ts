import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registryV1 } from '../docs/paths/v1/api.js';
import { registryAdminV1 } from '../docs/paths/v1/admin-api.js';

export function generateOpenAPISpec(): any {
  const generator = new OpenApiGeneratorV3(registryV1.definitions);
  const doc = generator.generateDocument({
    openapi: '3.0.3',
    info: { title: 'API Docs', version: '1.0.0' },
  });
  return doc;
}

export function generateAdminOpenAPISpec(): any {
  const generator = new OpenApiGeneratorV3(registryAdminV1.definitions);
  const doc = generator.generateDocument({
    openapi: '3.0.3',
    info: { title: 'Admin API Docs', version: '1.0.0' },
  });
  return doc;
}
