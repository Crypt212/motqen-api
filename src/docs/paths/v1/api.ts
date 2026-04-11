import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import registerAuthDocs from './auth.docs.js';
import registerChatDocs from './chat.docs.js';
import registerDashboardDocs from './dashboard.docs.js';
import registerGovernmentsDocs from './governments.docs.js';
import registerSpecializationsDocs from './specializations.docs.js';
import registerWorkersDocs from './workers.docs.js';

export const registryV1 = new OpenAPIRegistry();

registerAuthDocs(registryV1);
registerChatDocs(registryV1);
registerDashboardDocs(registryV1);
registerGovernmentsDocs(registryV1);
registerSpecializationsDocs(registryV1);
registerWorkersDocs(registryV1);

registryV1.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registryV1.registerComponent('parameters', 'DeviceFingerprint', {
  in: 'header',
  name: 'X-device-fingerprint',
  required: true,
  schema: {
    type: 'string',
    default: 'abc123',
  },
});
