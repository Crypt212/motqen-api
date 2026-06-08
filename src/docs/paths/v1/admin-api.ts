import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import registerAdminDocs from './admin.docs.js';
import registerAdminGovernmentsDocs from './admin/governments.docs.js';
import registerAdminSpecializationsDocs from './admin/specializations.docs.js';
import registerAdminReportsDocs from './admin/reports.docs.js';
import registerAdminIssuesDocs from './admin/issues.docs.js';
import registerAdminVerificationsDocs from './admin/verifications.docs.js';
import registerAdminWithdrawalsDocs from './admin/withdrawals.docs.js';
import registerAdminAdminsDocs from './admin/admins.docs.js';
import registerAdminCasesDocs from './admin/cases.docs.js';

export const registryAdminV1 = new OpenAPIRegistry();

registerAdminDocs(registryAdminV1);
registerAdminGovernmentsDocs(registryAdminV1);
registerAdminSpecializationsDocs(registryAdminV1);
registerAdminReportsDocs(registryAdminV1);
registerAdminIssuesDocs(registryAdminV1);
registerAdminVerificationsDocs(registryAdminV1);
registerAdminWithdrawalsDocs(registryAdminV1);
registerAdminAdminsDocs(registryAdminV1);
registerAdminCasesDocs(registryAdminV1);

registryAdminV1.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});
