import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { registryV1 } from '../docs/paths/v1/api.js';

// Import each docs file to register its paths
registryV1.definitions;
export function generateOpenAPISpec() {
  const generator = new OpenApiGeneratorV31(registryV1.definitions);
  const doc = generator.generateDocument({
    openapi: '3.1.0',
    info: { title: 'API Docs', version: '1.0.0' },
  });
  return doc;
}
