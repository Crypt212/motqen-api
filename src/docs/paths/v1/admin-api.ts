import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import registerAdminDocs from './admin.docs.js';
import registerAdminGovernmentsDocs from './admin/governments.docs.js';
import registerAdminSpecializationsDocs from './admin/specializations.docs.js';
import registerAdminReportsDocs from './admin/reports.docs.js';

export const registryAdminV1 = new OpenAPIRegistry();

registerAdminDocs(registryAdminV1);
registerAdminGovernmentsDocs(registryAdminV1);
registerAdminSpecializationsDocs(registryAdminV1);
registerAdminReportsDocs(registryAdminV1);

registryAdminV1.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});
